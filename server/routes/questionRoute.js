import express from 'express';
import { submitQuestion } from '../controllers/questionController.js';

const questionRouter = express.Router();

questionRouter.post('/', submitQuestion);

export default questionRouter;
