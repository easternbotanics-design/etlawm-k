import axios from "axios";
import db from "../pgdb.js";
import * as wa from "../services/whatsappService.js";
import { askGemini } from "../gemini.js";
import { getHistory, saveMessage } from "../chatMemory.js";

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
        const prompt = `Say hi to ${user.first_name ?? "the user"}`;
        const welcomeText = await askGemini(prompt);

        await sendWAMessage(
          user.phone_number,
          welcomeText,
        );
      } catch (messageError) {
        console.error(
          "[whatsapp-optin] message delivery failed:",
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

    const from = message.from;
    const userText = message.text?.body;

    if (!userText) {
      await wa.sendTextMessage(
        from,
        "Please send a text message.",
      );

      return res.sendStatus(200);
    }

    const history = getHistory(from);

    saveMessage(from, "user", userText);

    const aiReply = await askGemini(
      userText,
      history,
    );

    saveMessage(from, "bot", aiReply);

    await wa.sendTextMessage(
      from,
      aiReply,
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