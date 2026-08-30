import express from 'express';
import { getPublicConcerns } from '../controllers/concernController.js';

const concernRouter = express.Router();

concernRouter.get('/', getPublicConcerns);

export default concernRouter;
