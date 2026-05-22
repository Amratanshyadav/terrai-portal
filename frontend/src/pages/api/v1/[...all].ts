import app from '../../../backend/app';
import { connectDB } from '../../../backend/config/db';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false, // Let Express handle request body parsing
  },
};

let dbConnected = false;

export default async function handler(req: any, res: any) {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (err: any) {
      console.error('Database connection error in Serverless Function:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error: Database connection failed.',
        error: err.message,
      });
    }
  }
  return app(req, res);
}
