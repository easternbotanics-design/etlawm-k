import express from "express";

import { upsertReview, getProductReviews, deleteReview } from "../controllers/reviewController.js";

import { requireAuth } from "../middleware/auth.js";

import {
  getPublicCmsReviews,
} from "../controllers/reviewController.js";
import { getPublicHomepageReviews } from "../controllers/homepageReviewController.js";

const reviewRouter = express.Router();

reviewRouter.get("/cms", getPublicCmsReviews);
reviewRouter.get("/homepage", getPublicHomepageReviews);


reviewRouter.get("/product/:product_id", getProductReviews );

reviewRouter.post("/", requireAuth, upsertReview);

reviewRouter.delete("/product/:product_id", requireAuth, deleteReview);

export default reviewRouter;