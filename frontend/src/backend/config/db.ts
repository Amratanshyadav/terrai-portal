import mongoose from 'mongoose';
import logger from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    logger.error('Database connection failed: MONGO_URI is not defined in environment variables.');
    throw new Error('MONGO_URI is not defined');
  }

  // In serverless environment, reuse connection if already active
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    // Only bind event listeners once to prevent warnings in serverless
    if (mongoose.connection.listeners('connected').length === 0) {
      mongoose.connection.on('connected', () => {
        logger.info('Successfully connected to MongoDB.');
      });

      mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected.');
      });
    }

    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (err: any) {
    logger.error(`Failed to initialize Mongoose connection: ${err.message}`);
    throw err;
  }
};
