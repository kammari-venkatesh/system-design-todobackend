import path from 'path';
import { fileURLToPath } from 'url';
import './config/env.js';
import { validateEnv } from './config/validateEnv.js';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { syncUserIndexes } from './config/syncIndexes.js';
import authRoutes from './routes/auth.js';
import planRoutes from './routes/plan.js';
import progressRoutes from './routes/progress.js';
import analyticsRoutes from './routes/analytics.js';
import searchRoutes from './routes/search.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

validateEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  app.set('trust proxy', 1);
}

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((s) => s.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:4173'];

if (isProd && process.env.FRONTEND_URL) {
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
} else if (isProd) {
  console.warn('CORS: FRONTEND_URL not set — only non-browser requests will succeed until you configure it');
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (!isProd || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

app.use(notFoundHandler);
app.use(errorHandler);

connectDB()
  .then(async () => {
    await syncUserIndexes();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message || err);
    if (process.env.NODE_ENV === 'production') {
      console.error('Check MONGO_URI, JWT_SECRET, FRONTEND_URL, and PUBLIC_URL in your host env settings.');
    }
    process.exit(1);
  });
