import express from 'express';
import adminAuth from '../middlewares/adminAuth.js';
import upload from '../middlewares/uploadImg.js';
import { getActiveSessions, revokeSession, revokeUserSessions } from "../controllers/sessionController.js";
import {adminDashboard, adminLogin, adminLogout, createUser, deleteOrder, deleteProduct, generateOrderInvoice, getAdminStats, getAllProducts,getAllOrders, getOrderById, getProductById, getUserById, updateOrderStatus, updateProduct, sendNoticeEmails, getRecentNotices} from '../controllers/adminController.js';



const adminRouter= express.Router(); 

adminRouter.post('/login', adminLogin);
adminRouter.post('/logout', adminLogout);

adminRouter.get('/stats',adminAuth, getAdminStats);
adminRouter.get('/dashboard',adminAuth, adminDashboard);
adminRouter.get('/sessions', adminAuth, getActiveSessions);
adminRouter.post('/sessions/:sessionId/revoke', adminAuth, revokeSession);
adminRouter.post('/sessions/user/:userId/revoke-all', adminAuth, revokeUserSessions);
adminRouter.post('/create-user',adminAuth, createUser);
adminRouter.get('/user/:id',adminAuth, getUserById);

adminRouter.get('/products',adminAuth, getAllProducts);
adminRouter.get('/product/:id',adminAuth, getProductById);
adminRouter.put('/update-product/:id',adminAuth,upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]), updateProduct);
adminRouter.delete('/delete-product/:id',adminAuth, deleteProduct);

adminRouter.get('/orders',adminAuth, getAllOrders);
adminRouter.get('/order/:id',adminAuth, getOrderById);
adminRouter.get('/order/:id/invoice', adminAuth, generateOrderInvoice);
adminRouter.put('/update-order-status/:id',adminAuth, updateOrderStatus);
adminRouter.delete('/delete-order/:id',adminAuth, deleteOrder); 

// Notices
adminRouter.post('/notices/send', adminAuth, sendNoticeEmails);
adminRouter.get('/notices/recent', adminAuth, getRecentNotices);

export default adminRouter;