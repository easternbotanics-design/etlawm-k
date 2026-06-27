import express from "express";
import { createOrder, validateOrder } from "../controllers/paymentController2.js";
import { requireAuth } from "../middleware/auth.js";

const paymentRouter = express.Router();

paymentRouter.post(
  "/create-order",
  requireAuth, createOrder,
);

paymentRouter.post(
  "/validate-order",
  requireAuth, validateOrder,
);

export default paymentRouter;