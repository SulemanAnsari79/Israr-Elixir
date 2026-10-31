import express from 'express';
import upload from '../middlewares/uploadImg.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import { getStorefront, updateStorefront, uploadStorefrontImage } from '../controllers/storefrontController.js';

const storefrontRouter = express.Router();

storefrontRouter.get('/', getStorefront);
storefrontRouter.get('/admin', adminAuth, getStorefront);
storefrontRouter.put('/', adminAuth, updateStorefront);
storefrontRouter.post('/upload', adminAuth, upload.single('image'), uploadStorefrontImage);

export default storefrontRouter;
