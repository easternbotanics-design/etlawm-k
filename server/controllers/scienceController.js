import db from "../pgdb.js";

const createScience = async (req, res) => {
  const {
    name,
    descriptions = [],
    image_url,
    status = "published",
    sort_order = 0,
    is_active = true,
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Name is required.",
    });
  }

  try {
    const {
      rows: [createdScience],
    } = await db.cmsScience.create({
      name: name.trim(),
      descriptions: Array.isArray(descriptions) ? descriptions : [],
      image_url,
      status,
      sort_order,
      is_active,
    });

    return res.status(201).json({
      success: true,
      science: createdScience,
    });
  } catch (err) {
    console.error("[create cms science]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getAdminScience = async (req, res) => {
  try {
    const { rows: science } = await db.cmsScience.findAllAdmin();

    return res.json({
      success: true,
      science,
    });
  } catch (err) {
    console.error("[get admin cms science]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getPublicScience = async (req, res) => {
  try {
    const { rows: science } = await db.cmsScience.findPublished();

    return res.json({
      success: true,
      science,
    });
  } catch (err) {
    console.error("[get public cms science]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getScienceById = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [science],
    } = await db.cmsScience.findById(id);

    if (!science) {
      return res.status(404).json({
        success: false,
        message: "Science entry not found.",
      });
    }

    return res.json({
      success: true,
      science,
    });
  } catch (err) {
    console.error("[get cms science by id]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const updateScience = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [updatedScience],
    } = await db.cmsScience.update(id, req.body);

    if (!updatedScience) {
      return res.status(404).json({
        success: false,
        message: "Science entry not found.",
      });
    }

    return res.json({
      success: true,
      science: updatedScience,
    });
  } catch (err) {
    console.error("[update cms science]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const deleteScience = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [deletedScience],
    } = await db.cmsScience.delete(id);

    if (!deletedScience) {
      return res.status(404).json({
        success: false,
        message: "Science entry not found.",
      });
    }

    return res.json({
      success: true,
      message: "Science entry deleted.",
      science: deletedScience,
    });
  } catch (err) {
    console.error("[delete cms science]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

export {
  createScience,
  getAdminScience,
  getPublicScience,
  getScienceById,
  updateScience,
  deleteScience,
};
