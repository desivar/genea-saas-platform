import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables from a .env file later
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
// Allow your upcoming frontend (running on Vite's default port 5173) to communicate with this API
app.use(cors({ origin: 'http://localhost:5173' })); 
// Allow the server to parse incoming JSON payloads
app.use(express.json());

// A simple status route to verify the health of our API
app.get('/api/status', (req: Request, res: Response): void => {
  res.json({ status: 'Online', service: 'SaaS API Engine' });
});

// Start the engine
app.listen(PORT, () => {
  console.log(`🚀 Production-ready backend operational on port ${PORT}`);
});