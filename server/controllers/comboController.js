import db from "../pgdb.js";

export const getAllCombos = async (req, res) => {
  try {
    const combosList = await db.combos.findAll();
    res.json({
      success: true,
      combos: combosList,
    });
  } catch (err) {
    console.error("[getAllCombos]", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch combos.",
    });
  }
};

export const getComboById = async (req, res) => {
  try {
    const { id } = req.params;
    const combo = await db.combos.findById(id);
    if (!combo) {
      return res.status(404).json({ success: false, message: "Combo not found." });
    }
    res.json({
      success: true,
      combo,
    });
  } catch (err) {
    console.error("[getComboById]", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch combo.",
    });
  }
};

export const createCombo = async (req, res) => {
  try {
    const { name, slug, badge, price, original_price, description, image_url, images, discount_type, discount_value, starts_at, active_days, is_active, products, product_ids } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Combo name is required." });
    }

    if (!discount_type || !["percentage", "fixed"].includes(discount_type)) {
      return res.status(400).json({ success: false, message: "Discount type must be 'percentage' or 'fixed'." });
    }

    const val = Number(discount_value);
    if (isNaN(val) || val <= 0) {
      return res.status(400).json({ success: false, message: "Discount value must be a positive number." });
    }

    const productList = products || product_ids || [];
    if (!Array.isArray(productList) || productList.length === 0) {
      return res.status(400).json({ success: false, message: "At least one product must be selected for the combo." });
    }

    const combo = await db.combos.create({
      name: name.trim(),
      slug: slug ? slug.trim() : null,
      badge: badge || 'combo',
      price: price !== undefined && price !== null ? Number(price) : null,
      original_price: original_price !== undefined && original_price !== null ? Number(original_price) : null,
      description: description || null,
      image_url: image_url || null,
      images: images || [],
      discount_type,
      discount_value: val,
      starts_at: starts_at || null,
      active_days: active_days !== undefined ? Number(active_days) : -1,
      is_active: is_active ?? true,
      products: productList,
    });

    const fullCombo = await db.combos.findById(combo.id);

    res.status(201).json({
      success: true,
      message: "Combo created successfully.",
      combo: fullCombo,
    });
  } catch (err) {
    console.error("[createCombo]", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create combo.",
    });
  }
};

export const updateCombo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, badge, price, original_price, description, image_url, images, discount_type, discount_value, starts_at, active_days, is_active, products, product_ids } = req.body;

    const existing = await db.combos.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Combo not found." });
    }

    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name.trim();
    if (slug !== undefined) updatePayload.slug = slug ? slug.trim() : null;
    if (badge !== undefined) updatePayload.badge = badge;
    if (price !== undefined) updatePayload.price = price !== null ? Number(price) : null;
    if (original_price !== undefined) updatePayload.original_price = original_price !== null ? Number(original_price) : null;
    if (description !== undefined) updatePayload.description = description;
    if (image_url !== undefined) updatePayload.image_url = image_url;
    if (images !== undefined) updatePayload.images = images;
    if (discount_type !== undefined) updatePayload.discount_type = discount_type;
    if (discount_value !== undefined) updatePayload.discount_value = Number(discount_value);
    if (starts_at !== undefined) updatePayload.starts_at = starts_at;
    if (active_days !== undefined) updatePayload.active_days = Number(active_days);
    if (is_active !== undefined) updatePayload.is_active = is_active;
    if (products !== undefined || product_ids !== undefined) {
      updatePayload.products = products || product_ids;
    }

    await db.combos.update(id, updatePayload);
    const updatedCombo = await db.combos.findById(id);

    res.json({
      success: true,
      message: "Combo updated successfully.",
      combo: updatedCombo,
    });
  } catch (err) {
    console.error("[updateCombo]", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to update combo.",
    });
  }
};

export const deleteCombo = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.combos.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Combo not found." });
    }

    await db.combos.delete(id);
    res.json({
      success: true,
      message: "Combo deleted successfully.",
    });
  } catch (err) {
    console.error("[deleteCombo]", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to delete combo.",
    });
  }
};

export const toggleComboStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const existing = await db.combos.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Combo not found." });
    }

    const newStatus = is_active !== undefined ? Boolean(is_active) : !existing.is_active;
    await db.combos.update(id, { is_active: newStatus });
    const updatedCombo = await db.combos.findById(id);

    res.json({
      success: true,
      combo: updatedCombo,
    });
  } catch (err) {
    console.error("[toggleComboStatus]", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to toggle status.",
    });
  }
};
