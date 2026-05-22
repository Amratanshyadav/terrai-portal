import { Response, NextFunction } from 'express';
import { AiConversation } from '../models/AiConversation';
import { Mine } from '../models/Mine';
import { Worker } from '../models/Worker';
import { Machine } from '../models/Machine';
import { Alert } from '../models/Alert';
import { AuthenticatedRequest } from '../types';
import { AiClient } from '../utils/aiClient';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class AiController {
  /**
   * Post a new message to the chatbot. Persists conversation threads in MongoDB.
   */
  static async handleChat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message } = req.body;
      const userId = req.user?.id;

      if (!message) {
        return next(new BadRequestError('Chat prompt message is required.'));
      }

      if (!userId) {
        return next(new BadRequestError('User session ID not found.'));
      }

      // Find or create conversation for this user
      let convo = await AiConversation.findOne({ userId });
      if (!convo) {
        convo = new AiConversation({
          userId,
          messages: [],
        });
      }

      // Map mongoose messages to standard dict formats
      const conversationHistory = convo.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call Python FastAPI microservice wrapper
      const responseReply = await AiClient.askAssistant(conversationHistory, message);

      // Append user prompt and model response to thread
      convo.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
      });

      convo.messages.push({
        role: 'model',
        content: responseReply,
        timestamp: new Date(),
      });

      await convo.save();

      res.status(200).json({
        status: 'success',
        reply: responseReply,
        conversationId: convo._id,
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Fetch current conversation log for user.
   */
  static async getChatHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const convo = await AiConversation.findOne({ userId });

      res.status(200).json({
        status: 'success',
        data: { messages: convo ? convo.messages : [] },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Computes upcoming production forecasting based on historical results and current capacities.
   */
  static async getProductionForecast(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mineId } = req.query;

      if (!mineId) {
        return next(new BadRequestError('Target mineId query is required for forecasting.'));
      }

      const mine = await Mine.findById(mineId);
      if (!mine) {
        return next(new NotFoundError('Mine location not found'));
      }

      // Gather current operational resource metrics
      const workersCount = await Worker.countDocuments({ mineId, status: 'Active' });
      
      const totalMachines = await Machine.countDocuments({ mineId });
      const operationalMachines = await Machine.countDocuments({ mineId, status: 'Operational' });
      const machineRatio = totalMachines > 0 ? operationalMachines / totalMachines : 1.0;

      // Historical tonnages data (mocked or loaded from monthly actual summaries)
      // Since it's a new database, we feed a rich operational history array:
      const historicalData = [
        mine.actualProduction * 0.2 || 1200.0,
        mine.actualProduction * 0.35 || 1350.0,
        mine.actualProduction * 0.5 || 1450.0,
        mine.actualProduction * 0.75 || 1500.0,
        mine.actualProduction || 1650.0,
      ];

      // Invoke scikit-learn forecasting models
      const forecast = await AiClient.forecastProduction(
        historicalData,
        workersCount || 10,
        machineRatio
      );

      res.status(200).json({
        status: 'success',
        data: {
          mineName: mine.name,
          currentMonthlyTarget: mine.productionTarget,
          forecast,
        },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Returns security alerts and system-wide operation alerts.
   */
  static async getAlerts(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const alerts = await Alert.find()
        .populate('mineId', 'name')
        .populate('machineId', 'name serialNumber')
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: 'success',
        data: { alerts },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Resets or resolves an active alert status.
   */
  static async resolveAlert(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const alert = await Alert.findById(req.params.id);

      if (!alert) {
        return next(new NotFoundError('Active alert not found'));
      }

      alert.status = 'Resolved';
      alert.resolvedBy = req.user?.id as any;
      alert.resolvedAt = new Date();
      await alert.save();

      res.status(200).json({
        status: 'success',
        message: 'Alert resolved successfully.',
        data: { alert },
      });
    } catch (err: any) {
      next(err);
    }
  }
}
