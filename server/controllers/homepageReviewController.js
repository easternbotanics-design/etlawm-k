import db from "../pgdb.js";

const createHomepageReview = async (req, res) => {
  const {
    customer_name,
    product_name,
    product_link,
    heading,
    rating,
    review,
    status = "published",
    sort_order = 0,
    is_active = true,
  } = req.body;

  if (!customer_name || !product_name || rating == null || !review) {
    return res.status(400).json({
      success: false,
      message: "customer_name, product_name, rating, and review are required.",
    });
  }

  if (Number(rating) < 0 || Number(rating) > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 0 and 5.",
    });
  }

  try {
    const {
      rows: [createdReview],
    } = await db.homepageReviews.create({
      customer_name,
      product_name,
      product_link,
      heading,
      rating,
      review,
      status,
      sort_order,
      is_active,
    });

    return res.status(201).json({
      success: true,
      review: createdReview,
    });
  } catch (err) {
    console.error("[create homepage review]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getAdminHomepageReviews = async (req, res) => {
  try {
    const { rows: reviews } = await db.homepageReviews.findAllAdmin();

    return res.json({
      success: true,
      reviews,
    });
  } catch (err) {
    console.error("[get admin homepage reviews]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getPublicHomepageReviews = async (req, res) => {
  try {
    const { rows: reviews } = await db.homepageReviews.findPublished();

    return res.json({
      success: true,
      reviews,
    });
  } catch (err) {
    console.error("[get public homepage reviews]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getHomepageReviewById = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [review],
    } = await db.homepageReviews.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    return res.json({
      success: true,
      review,
    });
  } catch (err) {
    console.error("[get homepage review by id]", err);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const updateHomepageReview = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [updatedReview],
    } = await db.homepageReviews.update(id, req.body);

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    return res.json({
      success: true,
      review: updatedReview,
    });
  } catch (err) {
    console.error("[update homepage review]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const deleteHomepageReview = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [deletedReview],
    } = await db.homepageReviews.delete(id);

    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    return res.json({
      success: true,
      message: "Review deleted.",
      review: deletedReview,
    });
  } catch (err) {
    console.error("[delete homepage review]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

export {
  createHomepageReview,
  getAdminHomepageReviews,
  getPublicHomepageReviews,
  getHomepageReviewById,
  updateHomepageReview,
  deleteHomepageReview,
};
