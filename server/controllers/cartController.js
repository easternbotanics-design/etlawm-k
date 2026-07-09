import db from "../pgdb.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = (value) =>
  typeof value === "string" && UUID_PATTERN.test(value);

const resolveCart = async (req) => {
  if (req.user?.id) {
    const {
      rows: [cart],
    } = await db.carts.getOrCreateForUser(req.user.id);

    return { cart, type: "user" };
  }

  const guestId = req.headers["x-guest-id"];

  if (!guestId || typeof guestId !== "string" || guestId.length > 128) {
    const error = new Error("Guest ID is required.");
    error.status = 400;
    throw error;
  }

  const {
    rows: [cart],
  } = await db.carts.getOrCreateForGuest(guestId);

  return { cart, type: "guest" };
};

const getCart = async (req, res) => {
  try {
    const { cart, type } = await resolveCart(req);
    const { rows: items } = await db.cartItems.findByCart(cart.id);

    const itemCount = items.reduce(
      (total, item) => total + Number(item.quantity),
      0,
    );

    const subtotal = items.reduce(
      (total, item) =>
        total + Number(item.price) * Number(item.quantity),
      0,
    );

    // Fetch applied coupon (regular or early bird)
    let appliedCoupon = null;
    if (cart.coupon_id) {
      const { rows: [c] } = await db.query(
        `SELECT * FROM coupons WHERE id = $1 LIMIT 1`,
        [cart.coupon_id]
      );
      if (c) {
        appliedCoupon = {
          id: c.id,
          code: c.code,
          discount_type: c.discount_type,
          discount_value: c.discount_value,
        };
      }
    } else if (cart.early_bird_discount_id) {
      const ebResult = await db.earlyBirdDiscount.findById(cart.early_bird_discount_id);
      if (ebResult.rows.length > 0) {
        const eb = ebResult.rows[0];
        let isValid = eb.is_active && new Date() >= new Date(eb.starts_at) && (eb.user_limit === -1 || eb.used_count < eb.user_limit);

        if (isValid && req.user?.id) {
          const userUsage = await db.query(
            `SELECT EXISTS (
                SELECT 1 FROM orders 
                WHERE user_id = $1 
                  AND early_bird_discount_id = $2 
                  AND status IN ('paid', 'shipped', 'delivered')
             ) AS has_used`,
            [req.user.id, eb.id]
          );
          if (userUsage.rows[0].has_used) {
            isValid = false;
          }
        }

        if (isValid) {
          appliedCoupon = {
            id: eb.id,
            code: eb.coupon_code,
            discount_type: eb.discount_type,
            discount_value: eb.discount_value,
            is_early_bird: true,
          };
        } else {
          // If no longer valid, automatically clear it from the cart
          await db.earlyBirdDiscount.removeFromCart(cart.id);
        }
      }
    }

    res.json({
      success: true,
      cart: {
        id: cart.id,
        type,
        items,
        item_count: itemCount,
        subtotal,
        coupon: appliedCoupon,
      },
    });
  } catch (err) {
    console.error("[get cart]", err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Server error.",
    });
  }
}

const addCartItem = async (req, res) => {
  const productId = req.body.product_id ?? req.body.productId;
  const quantity = Number(req.body.quantity ?? 1);

  if (!isValidUuid(productId)) {
    return res.status(400).json({
      success: false,
      message: "A valid product_id UUID is required.",
    });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be a positive integer.",
    });
  }

  try {
    const { rows: productRows } = await db.products.findById(productId);
    const product = productRows[0];

    if (!product || !product.is_active) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const { cart } = await resolveCart(req);
    const { rows: currentItems } = await db.cartItems.findByCart(cart.id);

    const existingItem = currentItems.find(
      (item) => item.product_id === productId,
    );

    const newQuantity =
      Number(existingItem?.quantity ?? 0) + quantity;

    if (newQuantity > Number(product.stock_qty)) {
      return res.status(409).json({
        success: false,
        message: `Only ${product.stock_qty} item(s) are currently available.`,
      });
    }

    await db.cartItems.upsert({
      cart_id: cart.id,
      product_id: productId,
      quantity: newQuantity,
    });

    const { rows: items } = await db.cartItems.findByCart(cart.id);

    res.status(201).json({
      success: true,
      cart: {
        id: cart.id,
        items,
      },
    });
  } catch (err) {
    console.error("[add cart item]", err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Server error.",
    });
  }
}

const removeSelectedCartItems = async (req, res) => {
  const productIds = req.body.product_ids ?? req.body.productIds ?? req.body.cartItemIds;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "product_ids must be a non-empty array.",
    });
  }

  const invalidProductId = productIds.find((productId) => !isValidUuid(productId));

  if (invalidProductId) {
    return res.status(400).json({
      success: false,
      message: "Every product ID must be a valid UUID.",
    });
  }

  try {
    const { cart } = await resolveCart(req);

    await Promise.all(
      productIds.map((productId) =>
        db.cartItems.remove({
          cart_id: cart.id,
          product_id: productId,
        }),
      ),
    );

    const { rows: items } = await db.cartItems.findByCart(cart.id);

    res.json({
      success: true,
      cart: {
        id: cart.id,
        items,
      },
    });
  } catch (err) {
    console.error("[remove selected cart items]", err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Server error.",
    });
  }
}

const updateCartItemQuantity = async (req, res) => {
  const productId = req.params.productId;
  const quantity = Number(req.body.quantity);

  if (!isValidUuid(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be zero or a positive integer.",
    });
  }

  try {
    const { cart } = await resolveCart(req);

    if (quantity === 0) {
      await db.cartItems.remove({
        cart_id: cart.id,
        product_id: productId,
      });
    } else {
      const { rows: productRows } =
        await db.products.findById(productId);

      const product = productRows[0];

      if (!product || !product.is_active) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      if (quantity > Number(product.stock_qty)) {
        return res.status(409).json({
          success: false,
          message: `Only ${product.stock_qty} item(s) are currently available.`,
        });
      }

      const { rows: updatedRows } =
        await db.cartItems.updateQuantity({
          cart_id: cart.id,
          product_id: productId,
          quantity,
        });

      if (!updatedRows.length) {
        return res.status(404).json({
          success: false,
          message: "Item is not present in the cart.",
        });
      }
    }

    const { rows: items } = await db.cartItems.findByCart(cart.id);

    res.json({
      success: true,
      cart: {
        id: cart.id,
        items,
      },
    });
  } catch (err) {
    console.error("[update cart item]", err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Server error.",
    });
  }
}

const removeCartItem = async (req, res) => {
  const productId = req.params.productId;

  if (!isValidUuid(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }

  try {
    const { cart } = await resolveCart(req);

    await db.cartItems.remove({
      cart_id: cart.id,
      product_id: productId,
    });

    const { rows: items } = await db.cartItems.findByCart(cart.id);

    res.json({
      success: true,
      cart: {
        id: cart.id,
        items,
      },
    });
  } catch (err) {
    console.error("[remove cart item]", err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Server error.",
    });
  }
}

const clearCart = async (req, res) => {
  try {
    const { cart } = await resolveCart(req);

    await db.cartItems.clearCart(cart.id);

    res.json({
      success: true,
      cart: {
        id: cart.id,
        items: [],
      },
    });
  } catch (err) {
    console.error("[clear cart]", err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Server error.",
    });
  }
}

const mergeGuestCart = async (req, res) => {
  const { guest_id } = req.body;

  if (!guest_id || typeof guest_id !== "string" || guest_id.length > 128) {
    return res.status(400).json({
      success: false,
      message: "guest_id is required.",
    });
  }

  try {
    const {
      rows: [cart],
    } = await db.carts.mergeGuestToUser(
      guest_id,
      req.user.id,
    );

    const { rows: items } = await db.cartItems.findByCart(cart.id);

    res.json({
      success: true,
      cart: {
        id: cart.id,
        type: "user",
        items,
      },
    });
  } catch (err) {
    console.error("[merge cart]", err);

    res.status(500).json({
      success: false,
      message: "Could not merge the guest cart.",
    });
  }
}

const applyCartCoupon = async (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({
      success: false,
      message: "Coupon code is required.",
    });
  }

  try {
    const { cart, type } = await resolveCart(req);
    const { rows: items } = await db.cartItems.findByCart(cart.id);

    const subtotal = items.reduce(
      (total, item) =>
        total + Number(item.price) * Number(item.quantity),
      0,
    );

    const codeUpper = code.trim().toUpperCase();

    // 1. Try finding coupon in early_bird_discounts first
    const ebResult = await db.earlyBirdDiscount.findByCode(codeUpper);
    if (ebResult.rows.length > 0) {
      const eb = ebResult.rows[0];

      if (!eb.is_active || new Date() < new Date(eb.starts_at)) {
        return res.status(400).json({
          success: false,
          message: "This coupon code is not active yet.",
        });
      }

      if (eb.user_limit !== -1 && eb.used_count >= eb.user_limit) {
        return res.status(400).json({
          success: false,
          message: "This coupon code has reached its maximum redemption limit.",
        });
      }

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Please log in to apply this discount.",
        });
      }

      const userUsage = await db.query(
        `SELECT EXISTS (
            SELECT 1 FROM orders 
            WHERE user_id = $1 
              AND early_bird_discount_id = $2 
              AND status IN ('paid', 'shipped', 'delivered')
         ) AS has_used`,
        [req.user.id, eb.id]
      );

      if (userUsage.rows[0].has_used) {
        return res.status(400).json({
          success: false,
          message: "You have already successfully used this coupon.",
        });
      }

      // Valid: Apply early bird coupon to cart (which resets coupon_id to NULL)
      await db.earlyBirdDiscount.applyToCart({ cart_id: cart.id, early_bird_id: eb.id });

      let discount = 0;
      if (eb.discount_type === "percentage") {
        discount = Math.floor(subtotal * (Number(eb.discount_value) / 100));
      } else if (eb.discount_type === "fixed") {
        discount = Number(eb.discount_value);
      }
      discount = Math.min(discount, subtotal);

      return res.json({
        success: true,
        cart: {
          id: cart.id,
          type,
          items,
          item_count: items.reduce(
            (total, item) => total + Number(item.quantity),
            0,
          ),
          subtotal,
          discount,
          total: subtotal - discount,
          coupon: {
            id: eb.id,
            code: eb.coupon_code,
            discount_type: eb.discount_type,
            discount_value: eb.discount_value,
            is_early_bird: true,
          },
        },
      });
    }

    // 2. Fallback to standard coupons
    const {
      rows: [coupon],
    } = await db.coupons.findValidByCode(codeUpper);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired coupon code.",
      });
    }

    if (
      coupon.minimum_order_value &&
      subtotal < Number(coupon.minimum_order_value)
    ) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value is ₹${coupon.minimum_order_value}.`,
      });
    }

    let discount = 0;

    if (coupon.discount_type === "percentage") {
      discount = Math.floor(
        subtotal *
        (Number(coupon.discount_value) / 100)
      );
    } else if (coupon.discount_type === "fixed") {
      discount = Number(coupon.discount_value);
    }

    if (coupon.maximum_discount) {
      discount = Math.min(
        discount,
        Number(coupon.maximum_discount),
      );
    }

    discount = Math.min(discount, subtotal);

    // Apply normal coupon (clears early_bird_discount_id)
    await db.carts.applyCoupon({
      cart_id: cart.id,
      coupon_id: coupon.id,
    });
    await db.earlyBirdDiscount.removeFromCart(cart.id);

    return res.json({
      success: true,
      cart: {
        id: cart.id,
        type,
        items,
        item_count: items.reduce(
          (total, item) =>
            total + Number(item.quantity),
          0,
        ),
        subtotal,
        discount,
        total: subtotal - discount,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
        },
      },
    });
  } catch (err) {
    console.error("[apply coupon]", err);

    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Server error.",
    });
  }
};

const removeCartCoupon = async (req, res) => {
  try {
    const { cart, type } = await resolveCart(req);

    // Clear both
    await db.carts.removeCoupon(cart.id);
    await db.earlyBirdDiscount.removeFromCart(cart.id);

    const { rows: items } =
      await db.cartItems.findByCart(cart.id);

    const itemCount = items.reduce(
      (total, item) =>
        total + Number(item.quantity),
      0,
    );

    const subtotal = items.reduce(
      (total, item) =>
        total +
        Number(item.price) * Number(item.quantity),
      0,
    );

    return res.json({
      success: true,
      cart: {
        id: cart.id,
        type,
        items,
        item_count: itemCount,
        subtotal,
        discount: 0,
        total: subtotal,
        coupon: null,
      },
    });
  } catch (err) {
    console.error("[remove coupon]", err);

    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Server error.",
    });
  }
};

export { applyCartCoupon, removeCartCoupon, getCart, addCartItem, removeSelectedCartItems, updateCartItemQuantity, removeCartItem, clearCart, mergeGuestCart };
