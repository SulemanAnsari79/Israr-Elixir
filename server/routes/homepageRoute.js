import express from 'express';
import { adminAuth } from '../middlewares/adminAuth.js';
import { getHomepage, getHomepageAdmin, updateHomepage } from '../controllers/homepageController.js';

const homepageRouter = express.Router();
homepageRouter.get('/', getHomepage);
homepageRouter.get('/admin', adminAuth, getHomepageAdmin);
homepageRouter.put('/', adminAuth, updateHomepage);

export default homepageRouter;
