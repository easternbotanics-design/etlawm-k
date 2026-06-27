import db from "../pgdb.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = (value) => {
  return typeof value === "string" && UUID_PATTERN.test(value);
};

// Place a new order
const placeOrder = async (req, res) => {
  const { shipping, items } = req.body;

  if (!shipping || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Shipping and at least one item are required.",
    });
  }

  const { name, line1, city, state, pincode } = shipping;

  if (!name || !line1 || !city || !state || !pincode) {
    return res.status(400).json({
      success: false,
      message: "All shipping fields are required.",
    });
  }

  try {
    const trustedItems = [];

    for (const item of items) {
      const productId = item.product_id;
      const quantity = Number(item.quantity);

      if (
        !isValidUuid(productId) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Every item must contain a valid product_id and positive quantity.",
        });
      }

      const { rows } = await db.products.findById(productId);
      const product = rows[0];

      if (!product || !product.is_active) {
        return res.status(404).json({
          success: false,
          message: `Product ${productId} was not found.`,
        });
      }

      if (quantity > Number(product.stock_qty)) {
        return res.status(409).json({
          success: false,
          message: `Only ${product.stock_qty} item(s) of ${product.name} are available.`,
        });
      }

      trustedItems.push({
        product_id: product.id,
        quantity,
        unit_price: Number(product.price),
      });
    }

    const {
      rows: [order],
    } = await db.orders.create({
      user_id: req.user.id,
      shipping,
      items: trustedItems,
    });

    if (!order) {
      return res.status(500).json({
        success: false,
        message: "Order could not be created.",
      });
    }

    return res.status(201).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("[place order]", err);

    if (err.message?.startsWith("Insufficient stock")) {
      return res.status(409).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Get all orders belonging to the logged-in user
const getUserOrders = async (req, res) => {
  try {
    const { rows } = await db.orders.findByUser(req.user.id);

    return res.json({
      success: true,
      orders: rows,
    });
  } catch (err) {
    console.error("[get orders]", err);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Get one order and its items
const getOrderById = async (req, res) => {
  try {
    const { rows } = await db.orders.findById(req.params.id);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const order = rows[0];

    if (order.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const { rows: items } = await db.orders.getItems(req.params.id);

    return res.json({
      success: true,
      order: {
        ...order,
        items,
      },
    });
  } catch (err) {
    console.error("[get order]", err);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Admin: update an order's status
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const allowedStatuses = [
    "paid",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required.",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status.",
    });
  }

  try {
    const {
      rows: [order],
    } = await db.orders.updateStatus(req.params.id, status);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("[update order status]", err);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

export {
  placeOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
};