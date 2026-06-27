import express from 'express';
import { getAllCategory } from '../controllers/categoryController.js';

const categoryRouter = express.Router();

categoryRouter.get('/', getAllCategory);

export default categoryRouter;