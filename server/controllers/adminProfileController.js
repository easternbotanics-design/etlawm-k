import db from "../pgdb.js";
import { signToken } from "../middleware/auth.js";

//get
const getAdminProfile = async (req, res) => {
  try {
    const { rows } = await db.users.findById(req.user.id);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Admin user not found." });
    }
    const user = rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        phone_number: user.phone_number,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        onboarding_step: user.onboarding_step,
        is_admin: user.is_admin,
        is_active: user.is_active,
      },
    });
  } catch (err) {
    console.error("[get-admin-profile]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//patch
const updateAdminProfile = async (req, res) => {
  const { first_name, last_name, email } = req.body;

  if (!first_name || !first_name.trim()) {
    return res.status(400).json({ success: false, message: "First name is required." });
  }

  try {
    if (email && email.trim()) {
      const trimmedEmail = email.trim();
      const { rows: emailCheck } = await db.users.findByEmail(trimmedEmail);
      if (emailCheck.length > 0 && emailCheck[0].id !== req.user.id) {
        return res
          .status(409)
          .json({
            success: false,
            message: "Email address already in use by another account.",
          });
      }
    }

    const { rows } = await db.users.update(req.user.id, {
      first_name: first_name.trim(),
      last_name: last_name ? last_name.trim() : null,
      email: email ? email.trim() : null,
    });

    const user = rows[0];

    const token = signToken({
      id: user.id,
      phone_number: user.phone_number,
      onboarding_step: user.onboarding_step,
      is_admin: user.is_admin ?? false,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone_number: user.phone_number,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        onboarding_step: user.onboarding_step,
        is_admin: user.is_admin ?? false,
      },
    });
  } catch (err) {
    console.error("[update-admin-profile]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//get
const getAdminSettings = async (req, res) => {
  try {
    const { rows } = await db.adminSettings.getAll();
    const settingsObj = {};
    rows.forEach((r) => { settingsObj[r.key] = r.value });
    res.json({ success: true, settings: settingsObj });
  } catch (err) {
    console.error("[get-admin-settings]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//patch
const updateAdminSettings  = async (req, res) => {
  const settings = req.body;
  if (!settings || typeof settings !== "object") {
    return res.status(400).json({ success: false, message: "Invalid settings body." });
  }

  try {
    const keys = Object.keys(settings);
    const updated = {};
    for (const key of keys) {
      const { rows } = await db.adminSettings.set(key, String(settings[key]));
      if (rows.length) {
        updated[rows[0].key] = rows[0].value;
      }
    }
    res.json({
      success: true,
      settings: updated,
      message: "Settings updated successfully.",
    });
  } catch (err) {
    console.error("[update-admin-settings]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//post
const makeAdmin = async (req, res) => {
  const { phone_number } = req.body;
  if (!phone_number) {
    return res.status(400).json({ success: false, message: "phone_number is required." });
  }
  const digits = phone_number.replace(/\D/g, "");
  try {
    await db.adminPhones.add(digits);
    const { rows } = await db.users.findByPhone(digits);
    if (rows.length > 0) {
      await db.users.update(rows[0].id, { is_admin: true });
    }
    res.json({ success: true, message: `Phone number ${digits} is now reserved for admin and marked in user profile.` });
  } catch (err) {
    console.error("[make-admin]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//get
const getAdmins = async (req, res) => {
  try {
    const { rows } = await db.adminPhones.findAll();
    res.json({ success: true, phones: rows });
  } catch (err) {
    console.error("[get-admin-phones]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//delete
const removeAdmin = async (req, res) => {
  const { phone_number } = req.params;
  if (!phone_number) {
    return res
      .status(400)
      .json({ success: false, message: "phone_number is required." });
  }
  const digits = phone_number.replace(/\D/g, "");
  try {
    await db.adminPhones.remove(digits);
    // Sync is_admin flag: set it to false on the user record if they exist
    const { rows } = await db.users.findByPhone(digits);
    if (rows.length > 0) {
      await db.users.update(rows[0].id, { is_admin: false });
    }
    res.json({
      success: true,
      message: `Phone number ${digits} is no longer reserved for admin.`,
    });
  } catch (err) {
    console.error("[remove-admin-phone]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}


export { getAdminProfile, updateAdminProfile, getAdminSettings, updateAdminSettings, makeAdmin, getAdmins, removeAdmin }
