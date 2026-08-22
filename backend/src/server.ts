import app from './app';
import { env } from './config/env';
import prisma from './utils/prisma';

const startServer = async () => {
  try {
    // Check database connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database via Prisma');

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
