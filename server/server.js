import express from 'express';
import 'dotenv/config';
import { createServer } from 'http';
import dotenv from 'dotenv';
// import { existsSync } from 'fs';

import cors from 'cors';
import connectDB from './config/db.js';
import connectCloudinry from './config/cloudinary.js';

import helmet from "helmet";
import limiter from './middlewares/rateLimiter.js';
import cookieParser from 'cookie-parser';

import userRouter from './routes/userRoute.js';
import adminRouter from './routes/adminRoute.js';
import cartRouter from './routes/cartRoute.js';
import productRouter from './routes/productRoute.js';
import orderRouter from './routes/orderRoute.js';
import refundRouter from './routes/refundRoute.js';
import homepageRouter from './routes/homepageRoute.js';

dotenv.config();
const app= express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4001;


const getAllowedOrigins = () => {
    const configuredOrigins = [
        process.env.CORS_ORIGIN
    ]
        .filter(Boolean)
        .flatMap((value) => value.split(','))
        .map((value) => value.trim())
        .filter(Boolean);
    if (process.env.NODE_ENV !== 'production') {
        configuredOrigins.push(
            'http://localhost:5173'
        );
    }
    return [...new Set(configuredOrigins)];
};

const allowedOrigins = getAllowedOrigins();
const corsOrigin = allowedOrigins.length > 0 ? allowedOrigins : true;


connectCloudinry();

app.use(express.json());
app.use(cors({ origin: corsOrigin, credentials: true }));//, limiter:true
app.use(limiter);
app.use(helmet());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Server is running successfully');
});


app.use('/api/user',userRouter);
app.use('/api/admin',adminRouter);
app.use('/api/cart',cartRouter);
app.use('/api/product',productRouter);
app.use('/api/order',orderRouter);
app.use('/api/refund',refundRouter);
app.use('/api/homepage', homepageRouter);

app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

const startServer = async () => {
    try {
        await connectDB();
        httpServer.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(`Startup failed: ${error.message}`);
        process.exit(1);
    }
};

startServer();
