import express from "express";
import {
  getAllCombos,
  getComboById,
  createCombo,
  updateCombo,
  deleteCombo,
  toggleComboStatus,
} from "../controllers/comboController.js";
import { requireAdmin } from "../middleware/auth.js";

const comboRouter = express.Router();

// Public / Customer endpoint to view active combos if needed
comboRouter.get("/public", async (req, res) => {
  try {
    const db = (await import("../pgdb.js")).default;
    const activeCombos = await db.combos.findActive();
    res.json({ success: true, combos: activeCombos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin-guarded endpoints
comboRouter.get("/", requireAdmin, getAllCombos);
comboRouter.get("/:id", requireAdmin, getComboById);
comboRouter.post("/", requireAdmin, createCombo);
comboRouter.put("/:id", requireAdmin, updateCombo);
comboRouter.patch("/:id/status", requireAdmin, toggleComboStatus);
comboRouter.delete("/:id", requireAdmin, deleteCombo);

export default comboRouter;
