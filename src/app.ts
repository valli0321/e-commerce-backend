import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// @ts-ignore
import db, { sequelize } from "./models/index.js";

import storeRoutes from "./routes/storeRoutes";
import userRoutes from "./routes/userRoutes";
import billboardRoutes from "./routes/billboardRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import sizeRoutes from "./routes/sizeRoutes";
import { errorHandler } from './utils/errorHandler';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Limited to 100 request per windowMs (i.e. 100 req per 15 min)
  message: 'Too many requests from this IP, please try again later'
})

app.use(bodyParser.json());
app.use(cookieParser());

// API Routes

app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api", billboardRoutes);
app.use("/api", categoryRoutes);
app.use("/api", sizeRoutes);

// Rate limit for auth routes
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);

app.use(errorHandler);

const connectDB = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Connected to Database');

    await db.sequelize.sync({ alter: true });
    console.log('Database synced successfully');
  } catch (err: any) {
    console.error('Database connection error', err);
  }
};

connectDB();

export default app;