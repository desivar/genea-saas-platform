import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import memberRoutes from './routes/memberRoutes.js'; // <-- 1. Import your new routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// Connect to MongoDB Atlas
connectDB();

// Security & Parsing Middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' })); // Allow your Vite frontend to connect
app.use(express.json());

// 2. Mount your professional genealogy routes
app.use('/api/members', memberRoutes);

// Main Status Route
app.get('/api/status', (req: Request, res: Response): void => {
  res.json({ status: 'Online', service: 'SaaS API Engine' });
});

app.listen(PORT, () => {
  console.log(`🚀 Production-ready backend operational on port ${PORT}`);
});