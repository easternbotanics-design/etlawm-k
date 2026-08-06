import express from 'express';
import { getPublicScience } from '../controllers/scienceController.js';

const scienceRouter = express.Router();

scienceRouter.get('/', getPublicScience);

export default scienceRouter;
