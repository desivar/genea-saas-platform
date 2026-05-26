// ✅ dotenv must be the FIRST import
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { connectDB } from './db.js';
import authRoutes from './routes/authRoutes.js';
import mongoSanitize from 'express-mongo-sanitize';



const app = express();
const PORT = process.env.PORT || 5500;

// Connect to MongoDB Atlas
connectDB();

// Security & Parsing Middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use(mongoSanitize());

// Main Status Route
app.get('/api/status', (req: Request, res: Response): void => {
  res.json({ status: 'Online', service: 'SaaS API Engine' });
});

app.listen(PORT, () => {
  console.log(`🚀 Production-ready backend operational on port ${PORT}`);
});