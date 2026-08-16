import mongoose from 'mongoose';
import { env } from './env';

let memoryServer: { getUri: () => string; stop: () => Promise<boolean> } | null = null;

async function startMemoryMongo(): Promise<string> {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const server = await MongoMemoryServer.create();
  memoryServer = server;
  const uri = server.getUri('one-for-all');
  console.log('Using in-memory MongoDB for local development');
  return uri;
}

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    if (env.NODE_ENV === 'production') {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }

    console.warn('Local MongoDB unavailable — falling back to in-memory database');
    try {
      const uri = await startMemoryMongo();
      await mongoose.connect(uri);
      console.log('In-memory MongoDB connected successfully');
    } catch (memoryError) {
      console.error('Failed to start in-memory MongoDB:', memoryError);
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});
