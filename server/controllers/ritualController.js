import db from "../pgdb.js";

const createRitual = async (req, res) => {
  const {
    product_id,
    image_url,
    title,
    description,
    status = "published",
    is_active = true,
    whys = [],
    hows = [],
    tips = [],
  } = req.body;

  if (!product_id) {
    return res.status(400).json({
      success: false,
      message: "product_id is required.",
    });
  }

  try {
    const createdRitual = await db.rituals.create({
      product_id,
      image_url,
      title,
      description,
      status,
      is_active,
      whys,
      hows,
      tips,
    });

    return res.status(201).json({
      success: true,
      ritual: createdRitual,
    });
  } catch (err) {
    console.error("[create ritual]", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error.",
    });
  }
};

const getAdminRituals = async (req, res) => {
  try {
    const { rows: rituals } = await db.rituals.findAllAdmin();
    return res.json({
      success: true,
      rituals,
    });
  } catch (err) {
    console.error("[get admin rituals]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getRitualById = async (req, res) => {
  const { id } = req.params;
  try {
    const ritual = await db.rituals.findById(id);
    if (!ritual) {
      return res.status(404).json({
        success: false,
        message: "Ritual not found.",
      });
    }
    return res.json({
      success: true,
      ritual,
    });
  } catch (err) {
    console.error("[get ritual by id]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const updateRitual = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedRitual = await db.rituals.update(id, req.body);
    return res.json({
      success: true,
      ritual: updatedRitual,
    });
  } catch (err) {
    console.error("[update ritual]", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error.",
    });
  }
};

const deleteRitual = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: [deletedRitual] } = await db.rituals.delete(id);
    if (!deletedRitual) {
      return res.status(404).json({
        success: false,
        message: "Ritual not found.",
      });
    }
    return res.json({
      success: true,
      message: "Ritual deleted successfully.",
      ritual: deletedRitual,
    });
  } catch (err) {
    console.error("[delete ritual]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getPublicRituals = async (req, res) => {
  try {
    const { rows: rituals } = await db.rituals.findPublished();
    return res.json({
      success: true,
      rituals,
    });
  } catch (err) {
    console.error("[get public rituals]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

export {
  createRitual,
  getAdminRituals,
  getPublicRituals,
  getRitualById,
  updateRitual,
  deleteRitual,
};
