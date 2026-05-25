import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// Connect to MongoDB Atlas
connectDB();

// Security & Parsing Middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json());

// Main Status Route
app.get('/api/status', (req: Request, res: Response): void => {
  res.json({ status: 'Online', service: 'SaaS API Engine' });
});

app.listen(PORT, () => {
  console.log(`🚀 Production-ready backend operational on port ${PORT}`);
});