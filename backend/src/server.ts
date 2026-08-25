import app from './app';
import { env } from './config/env';
import prisma from './utils/prisma';
import { startScheduler } from './services/scheduler.service';

const startServer = async () => {
  try {
    // Check database connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database via Prisma');

    startScheduler();

    const port = env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
