import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import initSocket from './sockets';
import { seedDefaultAchievements } from './utils/gamification';
import { seedDefaultCommunities } from './utils/seedCommunities';
import './config/cloudinary';

const startServer = async (): Promise<void> => {
  await connectDB();
  await seedDefaultAchievements();
  await seedDefaultCommunities();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 One for All server running on port ${env.PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log(`🌐 Client URL: ${env.CLIENT_URL}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
