import axios from "axios";
import db from "../pgdb.js";
import * as wa from "../services/whatsappService.js";
import { askGemini } from "../gemini.js";
import {
  getHistory,
  saveMessage,
  isHumanEscalated,
  setHumanEscalated,
  checkRateLimit,
  isDuplicateMessage
} from "../chatMemory.js";

const getWaApiUrl = () =>
  `https://graph.facebook.com/v25.0/` +
  `${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

const sendWAMessage = async (to, message) => {
  await axios({
    url: getWaApiUrl(),
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: message,
      },
    },
  });
};

// PATCH /api/user/whatsapp-optin
const updateWhatsappOptIn = async (req, res) => {
  const { consent } = req.body;

  if (typeof consent !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "`consent` must be a boolean.",
    });
  }

  try {
    const { rows } = await db.users.setWhatsappOptIn(
      req.user.id,
      consent,
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (consent) {
      try {
        const templateName = process.env.WA_WELCOME_TEMPLATE || 'hello_world';
        console.log(`[whatsapp-optin] Sending welcome template: ${templateName} to ${user.phone_number}`);
        await wa.sendTemplateMessage(
          user.phone_number,
          templateName,
          'en_US'
        );
      } catch (messageError) {
        console.error(
          "[whatsapp-optin] welcome template delivery failed:",
          messageError.response?.data ?? messageError.message,
        );
      }
    }

    return res.json({
      success: true,
      whatsapp_opt_in: user.whatsapp_opt_in,
    });
  } catch (err) {
    console.error("[whatsapp-optin]", err);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// GET /webhook
const verifyWhatsappWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.VERIFY_TOKEN
  ) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};

// POST /webhook
const handleWhatsappWebhook = async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    // Delivery/read-status events may not contain a message
    if (!message) {
      return res.sendStatus(200);
    }

    // 1. De-duplication check
    const messageId = message.id;
    if (isDuplicateMessage(messageId)) {
      console.log(`[whatsapp webhook] Ignoring duplicate webhook event: ${messageId}`);
      return res.sendStatus(200);
    }

    const from = message.from;
    const userText = message.text?.body;

    if (!userText) {
      await wa.sendTextMessage(
        from,
        "Please send a text message.",
      );

      return res.sendStatus(200);
    }

    // 2. Human escalation check
    const cleanText = userText.trim().toLowerCase();
    const escalationKeywords = ["human", "agent", "support", "talk to a person", "talk to agent", "representative"];
    const isEscalationRequest = escalationKeywords.some(keyword => cleanText.includes(keyword));

    if (isEscalationRequest) {
      setHumanEscalated(from, true);
      const handoffNotice = "I am passing your chat to a human team member. They will get back to you shortly. (To resume chatting with the AI, reply with 'start bot'.)";
      saveMessage(from, "bot", handoffNotice);
      await wa.sendTextMessage(from, handoffNotice);
      return res.sendStatus(200);
    }

    // If session is escalated to human, ignore AI bot logic unless they resume it
    if (isHumanEscalated(from)) {
      if (cleanText === "start bot" || cleanText === "startbot" || cleanText === "resume bot") {
        setHumanEscalated(from, false);
        const resumeNotice = "🤖 [AI Assistant]: Bot conversation resumed. How can I help you today?";
        saveMessage(from, "bot", resumeNotice);
        await wa.sendTextMessage(from, resumeNotice);
        return res.sendStatus(200);
      }
      console.log(`[whatsapp webhook] Chat with ${from} is escalated to human. Ignoring AI response.`);
      return res.sendStatus(200);
    }

    // 3. Rate limiting check
    if (!checkRateLimit(from)) {
      console.log(`[whatsapp webhook] Rate limit exceeded for ${from}. Dropping message.`);
      return res.sendStatus(200);
    }

    const history = getHistory(from);

    saveMessage(from, "user", userText);

    const aiReply = await askGemini(
      userText,
      history,
    );

    // 4. Prepend visual bot indicator for transparency
    const prefixedReply = `🤖 [AI Assistant]: ${aiReply}`;

    saveMessage(from, "bot", prefixedReply);

    await wa.sendTextMessage(
      from,
      prefixedReply,
    );

    return res.sendStatus(200);
  } catch (err) {
    console.error("[whatsapp webhook]", err);

    // Return 200 so Meta does not repeatedly resend the same event
    return res.sendStatus(200);
  }
};

export {
  updateWhatsappOptIn,
  verifyWhatsappWebhook,
  handleWhatsappWebhook,
};