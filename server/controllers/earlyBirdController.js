import db from "../pgdb.js";

// Admin: Get all early bird campaigns
export const getAllCampaigns = async (req, res) => {
  try {
    const { rows } = await db.earlyBirdDiscount.findAll();
    return res.json({
      success: true,
      campaigns: rows,
    });
  } catch (err) {
    console.error("[get-all-early-bird-campaigns]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Admin: Create a new early bird campaign
export const createCampaign = async (req, res) => {
  const { coupon_code, discount_value, discount_type, user_limit, starts_at, is_active } = req.body;

  if (!coupon_code || !coupon_code.trim()) {
    return res.status(400).json({ success: false, message: "Coupon code is required." });
  }

  const val = Number(discount_value);
  if (isNaN(val) || val <= 0) {
    return res.status(400).json({ success: false, message: "Discount value must be a positive number." });
  }

  if (discount_type !== "percentage" && discount_type !== "fixed") {
    return res.status(400).json({ success: false, message: "Discount type must be percentage or fixed." });
  }

  const limit = Number(user_limit ?? 100);
  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ success: false, message: "User limit must be a positive integer." });
  }

  try {
    // Check if code already exists
    const codeUpper = coupon_code.trim().toUpperCase();
    const existing = await db.earlyBirdDiscount.findByCode(codeUpper);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: `Coupon code '${codeUpper}' already exists.` });
    }

    const { rows } = await db.earlyBirdDiscount.create({
      coupon_code: codeUpper,
      discount_value: val,
      discount_type,
      user_limit: limit,
      starts_at: starts_at || new Date(),
      is_active: is_active !== false,
    });

    return res.status(201).json({
      success: true,
      campaign: rows[0],
      message: "Early bird campaign created successfully.",
    });
  } catch (err) {
    console.error("[create-early-bird-campaign]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Admin: Update an existing early bird campaign
export const updateCampaign = async (req, res) => {
  const { id } = req.params;
  const { coupon_code, discount_value, discount_type, user_limit, starts_at, is_active } = req.body;

  try {
    const existing = await db.earlyBirdDiscount.findById(id);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Campaign not found." });
    }

    const updateFields = {};
    if (is_active !== undefined) updateFields.is_active = !!is_active;
    if (coupon_code !== undefined) {
      const codeUpper = coupon_code.trim().toUpperCase();
      // Check duplicate
      const duplicate = await db.earlyBirdDiscount.findByCode(codeUpper);
      if (duplicate.rows.length > 0 && duplicate.rows[0].id !== id) {
        return res.status(409).json({ success: false, message: `Coupon code '${codeUpper}' already exists.` });
      }
      updateFields.coupon_code = codeUpper;
    }
    if (discount_value !== undefined) {
      const val = Number(discount_value);
      if (isNaN(val) || val <= 0) {
        return res.status(400).json({ success: false, message: "Discount value must be a positive number." });
      }
      updateFields.discount_value = val;
    }
    if (discount_type !== undefined) {
      if (discount_type !== "percentage" && discount_type !== "fixed") {
        return res.status(400).json({ success: false, message: "Discount type must be percentage or fixed." });
      }
      updateFields.discount_type = discount_type;
    }
    if (user_limit !== undefined) {
      const limit = Number(user_limit);
      if (isNaN(limit) || limit <= 0) {
        return res.status(400).json({ success: false, message: "User limit must be a positive integer." });
      }
      updateFields.user_limit = limit;
    }
    if (starts_at !== undefined) {
      updateFields.starts_at = starts_at;
    }

    const { rows } = await db.earlyBirdDiscount.update(id, updateFields);

    return res.json({
      success: true,
      campaign: rows[0],
      message: "Early bird campaign updated successfully.",
    });
  } catch (err) {
    console.error("[update-early-bird-campaign]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Admin: Delete an early bird campaign
export const deleteCampaign = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await db.earlyBirdDiscount.findById(id);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Campaign not found." });
    }

    await db.earlyBirdDiscount.delete(id);

    return res.json({
      success: true,
      message: "Early bird campaign deleted successfully.",
    });
  } catch (err) {
    console.error("[delete-early-bird-campaign]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Public/Customer: Get campaign details by code
export const getCampaignByCode = async (req, res) => {
  const { code } = req.params;

  if (!code) {
    return res.status(400).json({ success: false, message: "Code parameter is required." });
  }

  try {
    const { rows } = await db.earlyBirdDiscount.findByCode(code.trim().toUpperCase());
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Coupon code not found." });
    }

    return res.json({
      success: true,
      campaign: rows[0],
    });
  } catch (err) {
    console.error("[get-campaign-by-code]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Admin: Relaunch an early bird campaign (resets count to 0 and reactivates)
export const relaunchCampaign = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await db.earlyBirdDiscount.findById(id);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Campaign not found." });
    }

    const { rows } = await db.earlyBirdDiscount.relaunch(id);

    return res.json({
      success: true,
      campaign: rows[0],
      message: "Early bird campaign relaunched successfully with usage count reset to 0.",
    });
  } catch (err) {
    console.error("[relaunch-early-bird-campaign]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
