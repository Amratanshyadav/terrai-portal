import mongoose from 'mongoose';
import logger from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    logger.error('Database connection failed: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    mongoose.connection.on('connected', () => {
      logger.info('Successfully connected to MongoDB Atlas database.');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB Atlas database disconnected.');
    });

    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (err: any) {
    logger.error(`Failed to initialize Mongoose connection: ${err.message}`);
    process.exit(1);
  }
};
