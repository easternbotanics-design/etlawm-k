import db from "../pgdb.js";

//get
const getAllCategory = async (req, res) => {
  try {
    const { rows } = await db.categories.findAll();

    res.json({
      success: true,
      categories: rows,
    });
  } catch (err) {
    console.error("[get categories]", err);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
}

//---Admin---

//post
const addCategory = async (req, res) => {
  const { name, slug, subtitle, description, image_url, is_active } = req.body;

  if (!name) {
    return res.status(400).json({success: false, message: "Category name is required."});
  }

  try {
    const { rows: [cat] } = await db.categories.create({ name, slug, subtitle, description, image_url, is_active });

    res.status(201).json({success: true, category: cat });
  } catch (err) {
    console.error("[create category]", err);
    res.status(500).json({ success: false, message: err.message || "Server error." });
  }
}

//patch
const updateCategory = async (req, res) => {
  try {
    const { rows: [category] } = await db.categories.update(req.params.id, req.body);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    res.json({ success: true, category });
  } catch (err) {
    console.error("[update category]", err);
    res.status(500).json({ success: false, message: err.message || "Server error." });
  }
}

//delete
const deleteCategory = async (req, res) => {
  try {
    await db.categories.delete(req.params.id);

    res.json({ success: true, message: "Category deleted." });
  } catch (err) {
    console.error("[delete category]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

export { getAllCategory, addCategory, updateCategory, deleteCategory };
