import express from "express";
import { applyCartCoupon, removeCartCoupon, getCart, addCartItem, removeSelectedCartItems, updateCartItemQuantity, removeCartItem, clearCart, mergeGuestCart } from "../controllers/cartController.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.get("/", optionalAuth, getCart);
cartRouter.post("/items", optionalAuth, addCartItem);
cartRouter.post("/items/remove-selected", optionalAuth, removeSelectedCartItems);
cartRouter.patch("/items/:productId", optionalAuth, updateCartItemQuantity);
cartRouter.delete("/items/:productId", optionalAuth, removeCartItem);
cartRouter.delete("/", optionalAuth, clearCart);
cartRouter.post("/merge", requireAuth, mergeGuestCart);
cartRouter.post("/coupon", applyCartCoupon);
cartRouter.delete("/coupon", removeCartCoupon);

export default cartRouter;
