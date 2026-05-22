import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { mongoSanitize } from './middleware/sanitize';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/errors';
import logger from './utils/logger';

// Load environmental variables
dotenv.config();

const app = express();

// --- 1. Security & Infrastructure Middleware ---
app.use(helmet());
app.use(cors({
  origin: '*', // Customize this with a domain blacklist/whitelist in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Protect against MongoDB query operator injection attacks
app.use(mongoSanitize);

// --- 2. Request Logging System (Morgan -> Winston Stream) ---
const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
app.use(morgan(':remote-addr - :method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

// --- 3. Mount REST APIs Routing ---
app.use('/api/v1', apiRoutes);

// Health check endpoint
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// --- 4. Error Catch Boundaries ---
// Trigger 404 for unhandled route requests
app.use((_req, _res, next) => {
  next(new NotFoundError('The requested API route does not exist.'));
});

// Global Centralized Error Interception Middleware
app.use(errorHandler);

export default app;
