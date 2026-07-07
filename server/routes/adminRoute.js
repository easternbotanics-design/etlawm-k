import express from 'express';
import { upload, uploadImage, addProduct, updateProduct, deleteProduct, addProductImage, setProductImagePrimary, deleteProductImage, syncProductIngredients } from '../controllers/productController.js';
import { addCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { getAdminProfile, updateAdminProfile, getAdminSettings, updateAdminSettings, makeAdmin, getAdmins, removeAdmin } from '../controllers/adminProfileController.js';
import {
  createCmsReview,
  getAdminCmsReviews,
  getPublicCmsReviews,
  getCmsReviewsByProduct,
  updateCmsReview,
  deleteCmsReview,
  getCmsReviewById
} from '../controllers/reviewController.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  createIngredient,
  getAdminIngredients,
  getIngredientById,
  updateIngredient,
  deleteIngredient
} from '../controllers/ingredientController.js';


const adminRouter = express.Router();

adminRouter.use(requireAdmin);

adminRouter.get('/profile', getAdminProfile);
adminRouter.patch('/profile', updateAdminProfile);

adminRouter.get('/settings', getAdminSettings);
adminRouter.patch('/settings', updateAdminSettings);

adminRouter.post('/admins', makeAdmin);
adminRouter.get('/admins', getAdmins);
adminRouter.delete('/admins/:phone_number', removeAdmin);

adminRouter.post('/categories', addCategory);
adminRouter.patch('/categories/:id', updateCategory);
adminRouter.delete('/categories/:id', deleteCategory);

adminRouter.post("/products", addProduct);
adminRouter.patch("/products/:id", updateProduct);
adminRouter.delete("/products/:id", deleteProduct);
adminRouter.post("/products/:id/ingredients", syncProductIngredients);

//see here this api call
adminRouter.post("/upload", upload.single("image"), uploadImage);
adminRouter.post("/products/:id/images", addProductImage);
adminRouter.patch("/products/:product_id/images/:id/primary", setProductImagePrimary);
adminRouter.delete("/products/:product_id/images/:id", deleteProductImage);

adminRouter.get("/reviews", getAdminCmsReviews);
adminRouter.post("/reviews", createCmsReview);
adminRouter.get("/reviews/product/:slug", getCmsReviewsByProduct);
adminRouter.get("/reviews/:id", getCmsReviewById);
adminRouter.patch("/reviews/:id", updateCmsReview);
adminRouter.delete("/reviews/:id", deleteCmsReview);

adminRouter.get("/ingredients", getAdminIngredients);
adminRouter.post("/ingredients", createIngredient);
adminRouter.get("/ingredients/:id", getIngredientById);
adminRouter.patch("/ingredients/:id", updateIngredient);
adminRouter.delete("/ingredients/:id", deleteIngredient);


export default adminRouter;
