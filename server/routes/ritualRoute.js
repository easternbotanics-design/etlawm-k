import express from 'express';
import { getPublicRituals } from '../controllers/ritualController.js';

const ritualRouter = express.Router();

ritualRouter.get('/', getPublicRituals);

export default ritualRouter;
