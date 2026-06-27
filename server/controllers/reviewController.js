import db from "../pgdb.js";

const upsertReview = async (req, res) => {
  const { product_id, rating, comment } = req.body;

  if (!product_id || !rating) {
    return res
      .status(400)
      .json({
        success: false,
        message: "product_id and rating are required.",
      });
  }
  if (rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ success: false, message: "Rating must be between 1 and 5." });
  }

  try {
    const {
      rows: [review],
    } = await db.reviews.upsert({ user_id: req.user.id, product_id, rating, comment });
    res.status(201).json({ success: true, review });
  } catch (err) {
    console.error("[upsert review]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { rows: reviews } = await db.reviews.findByProduct(
      req.params.product_id,
    );
    const {
      rows: [rating],
    } = await db.reviews.avgRating(req.params.product_id);
    res.json({ success: true, reviews, ...rating });
  } catch (err) {
    console.error("[get reviews]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const deleteReview = async (req, res) => {
  const { product_id } = req.params;

  try {
    await db.reviews.delete(req.user.id, product_id);

    return res.json({
      success: true,
      message: "Review deleted.",
    });
  } catch (err) {
    console.error("[delete review]", err);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const createCmsReview = async (req, res) => {
  const {
    customer_name,
    product_name,
    product_link,
    rating,
    review,
    status = "published",
    sort_order = 0,
    is_active = true,
  } = req.body;

  if (!customer_name || !product_name || !rating || !review) {
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
    } = await db.cmsReviews.create({
      customer_name,
      product_name,
      product_link,
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
    console.error("[create cms review]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getAdminCmsReviews = async (req, res) => {
  try {
    const { rows: reviews } = await db.cmsReviews.findAllAdmin();

    return res.json({
      success: true,
      reviews,
    });
  } catch (err) {
    console.error("[get admin cms reviews]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getPublicCmsReviews = async (req, res) => {
  try {
    const { rows: reviews } = await db.cmsReviews.findPublished();

    return res.json({
      success: true,
      reviews,
    });
  } catch (err) {
    console.error("[get public cms reviews]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getCmsReviewsByProduct = async (req, res) => {
  const { slug } = req.params;

  try {
    const { rows: reviews } = await db.cmsReviews.findByProductNameOrSlug(slug);

    return res.json({
      success: true,
      product_name: slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      reviews,
    });
  } catch (err) {
    console.error("[get cms reviews by product]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const updateCmsReview = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [updatedReview],
    } = await db.cmsReviews.update(id, req.body);

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
    console.error("[update cms review]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const deleteCmsReview = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [deletedReview],
    } = await db.cmsReviews.delete(id);

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
    console.error("[delete cms review]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getCmsReviewById = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [review],
    } = await db.cmsReviews.findById(id);

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
    console.error("[get cms review by id]", err);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

export { upsertReview, getProductReviews, deleteReview, createCmsReview,
  getAdminCmsReviews,
  getPublicCmsReviews,
  getCmsReviewsByProduct,
  updateCmsReview,
  deleteCmsReview,
  getCmsReviewById
};
