import express from "express";

import {
  updateWhatsappOptIn,
  verifyWhatsappWebhook,
  handleWhatsappWebhook,
} from "../controllers/whatsappController.js";

import { requireAuth } from "../middleware/auth.js";

const whatsappRouter = express.Router();

// Logged-in user enables or disables WhatsApp messages
whatsappRouter.patch(
  "/optin",
  requireAuth,
  updateWhatsappOptIn,
);

// Meta webhook verification
whatsappRouter.get(
  "/webhook",
  verifyWhatsappWebhook,
);

// Incoming WhatsApp messages and events
whatsappRouter.post(
  "/webhook",
  handleWhatsappWebhook,
);

export default whatsappRouter;