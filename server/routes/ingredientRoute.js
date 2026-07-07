import express from 'express';
import { getPublicIngredients } from '../controllers/ingredientController.js';

const ingredientRouter = express.Router();

ingredientRouter.get('/', getPublicIngredients);

export default ingredientRouter;
