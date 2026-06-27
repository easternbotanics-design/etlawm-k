import express from "express";

import {
  placeOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";

import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";

import { createOrder, validateOrder } from "../controllers/paymentController2.js";

const orderRouter = express.Router();

orderRouter.post("/", requireAuth, placeOrder);

orderRouter.get("/", requireAuth, getUserOrders);

orderRouter.get("/:id", requireAuth, getOrderById);

orderRouter.post("/payment", requireAdmin, createOrder);

orderRouter.patch(
  "/:id/status",
  requireAdmin,
  updateOrderStatus,
);

export default orderRouter;