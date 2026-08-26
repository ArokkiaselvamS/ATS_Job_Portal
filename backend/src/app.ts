import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import referralRoutes from './routes/referral.routes';
import adminRoutes from './routes/admin/index';
import profileRoutes from './routes/profile.routes';
import jobRoutes from './routes/job.routes';
import matchRoutes from './routes/match.routes';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Aescion API is running' });
});

// Routes — ORDER MATTERS: /api/admin must come BEFORE /api
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api', referralRoutes);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
