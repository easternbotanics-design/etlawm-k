import express from 'express';
import { getAllProducts, getProduct, productImages, getProductIngredients } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProduct);
productRouter.get('/:id/images', productImages);
productRouter.get('/:id/ingredients', getProductIngredients);

export default productRouter;
