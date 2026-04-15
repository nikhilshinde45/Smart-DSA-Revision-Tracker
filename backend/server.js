import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import revisionRoutes from './routes/revisionRoutes.js';
import statsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://smart-dsa-revision-tracker.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean); // removes undefined if CLIENT_URL is not set

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/revisions', revisionRoutes);
app.use('/api/stats', statsRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
