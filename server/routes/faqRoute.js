import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createCmsFaq,
  getAdminCmsFaqs,
  getPublicCmsFaqs,
  getCmsFaqsByProduct,
  getCmsFaqById,
  updateCmsFaq,
  deleteCmsFaq,
} from "../controllers/faqController.js";

const faqRouter = express.Router();

faqRouter.get("/cms", getPublicCmsFaqs);
faqRouter.get("/admin", requireAuth, getAdminCmsFaqs);
faqRouter.get("/product/:slug", getCmsFaqsByProduct);
faqRouter.get("/:id", getCmsFaqById);
faqRouter.post("/", requireAuth, createCmsFaq);
faqRouter.put("/:id", requireAuth, updateCmsFaq);
faqRouter.delete("/:id", requireAuth, deleteCmsFaq);

export default faqRouter;
