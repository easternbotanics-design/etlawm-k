import Razorpay from "razorpay";
import crypto from "crypto";
import db from "../pgdb.js";

let razorpayInstance = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

export async function createRazorpayOrder(req, res) {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "order_id is required.",
      });
    }

    const order = await db.orders.findById(order_id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (req.user && order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot pay for this order.",
      });
    }

    if (order.payment_status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid.",
      });
    }

    const amountInPaise = Math.round(Number(order.total_amount) * 100);

    if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount.",
      });
    }

    const razorpayOrder = await getRazorpay().orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.id,
      notes: {
        database_order_id: String(order.id),
        user_id: String(order.user_id ?? ""),
      },
    });

    await db.orders.updatePaymentOrderId(order.id, razorpayOrder.id);

    return res.status(201).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      razorpay_order: razorpayOrder,
    });
  } catch (error) {
    console.error("[createRazorpayOrder error]", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order.",
    });
  }
}

export async function verifyRazorpayPayment(req, res) {
  try {
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !order_id ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required.",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    await db.orders.markPaymentPaid({
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return res.json({
      success: true,
      message: "Payment verified successfully.",
      payment: {
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
      },
    });
  } catch (error) {
    console.error("[verifyRazorpayPayment error]", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify Razorpay payment.",
    });
  }
}
