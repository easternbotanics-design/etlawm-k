import db from "../pgdb.js";

const createIngredient = async (req, res) => {
  const {
    name,
    scientific_name,
    image_url,
    para1,
    para2,
    para3,
    status = "published",
    sort_order = 0,
    is_active = true,
  } = req.body;

  if (!name || !image_url || !para1 || !para2 || !para3) {
    return res.status(400).json({
      success: false,
      message: "name, image_url, and para1, para2, para3 are required.",
    });
  }

  try {
    const {
      rows: [createdIngredient],
    } = await db.cmsIngredients.create({
      name,
      scientific_name,
      image_url,
      para1,
      para2,
      para3,
      status,
      sort_order,
      is_active,
    });

    return res.status(201).json({
      success: true,
      ingredient: createdIngredient,
    });
  } catch (err) {
    console.error("[create cms ingredient]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getAdminIngredients = async (req, res) => {
  try {
    const { rows: ingredients } = await db.cmsIngredients.findAllAdmin();

    return res.json({
      success: true,
      ingredients,
    });
  } catch (err) {
    console.error("[get admin cms ingredients]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getPublicIngredients = async (req, res) => {
  try {
    const { rows: ingredients } = await db.cmsIngredients.findPublished();

    return res.json({
      success: true,
      ingredients,
    });
  } catch (err) {
    console.error("[get public cms ingredients]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getIngredientById = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [ingredient],
    } = await db.cmsIngredients.findById(id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found.",
      });
    }

    return res.json({
      success: true,
      ingredient,
    });
  } catch (err) {
    console.error("[get cms ingredient by id]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const updateIngredient = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [updatedIngredient],
    } = await db.cmsIngredients.update(id, req.body);

    if (!updatedIngredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found.",
      });
    }

    return res.json({
      success: true,
      ingredient: updatedIngredient,
    });
  } catch (err) {
    console.error("[update cms ingredient]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const deleteIngredient = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [deletedIngredient],
    } = await db.cmsIngredients.delete(id);

    if (!deletedIngredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found.",
      });
    }

    return res.json({
      success: true,
      message: "Ingredient deleted.",
      ingredient: deletedIngredient,
    });
  } catch (err) {
    console.error("[delete cms ingredient]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

export {
  createIngredient,
  getAdminIngredients,
  getPublicIngredients,
  getIngredientById,
  updateIngredient,
  deleteIngredient,
};
