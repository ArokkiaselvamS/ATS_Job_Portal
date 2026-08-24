import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import referralRoutes from './routes/referral.routes';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Aescion API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', referralRoutes);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
