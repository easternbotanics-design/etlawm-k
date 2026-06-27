import express from 'express';
import { getAllProducts, getProduct, productImages } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProduct);
productRouter.get('/:id/images', productImages);

export default productRouter;
