import express from "express";
import {
  getAllCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignByCode,
  relaunchCampaign,
  getActiveCampaign,
} from "../controllers/earlyBirdController.js";
import { requireAdmin } from "../middleware/auth.js";

const earlyBirdRouter = express.Router();

// Public / customer endpoints
earlyBirdRouter.get("/active", getActiveCampaign);
earlyBirdRouter.get("/code/:code", getCampaignByCode);

// Admin-only endpoints
earlyBirdRouter.get("/", requireAdmin, getAllCampaigns);
earlyBirdRouter.post("/", requireAdmin, createCampaign);
earlyBirdRouter.post("/:id/relaunch", requireAdmin, relaunchCampaign);
earlyBirdRouter.patch("/:id", requireAdmin, updateCampaign);
earlyBirdRouter.delete("/:id", requireAdmin, deleteCampaign);

export default earlyBirdRouter;
