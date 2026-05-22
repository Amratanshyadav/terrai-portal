import { Response, NextFunction } from 'express';
import { FuelLog } from '../models/FuelLog';
import { AuthenticatedRequest } from '../types';
import { BadRequestError } from '../utils/errors';

export class DieselController {
  /**
   * Log a new diesel distribution.
   */
  static async createFuelLog(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vehicleNumber, amount, cost, loggedBy, date } = req.body;

      if (!vehicleNumber || amount === undefined || cost === undefined || !loggedBy) {
        return next(new BadRequestError('Vehicle number, amount, cost, and logger name are required.'));
      }

      const fuelLog = new FuelLog({
        vehicleNumber: vehicleNumber.toUpperCase(),
        amount,
        cost,
        loggedBy,
        date: date || new Date(),
      });

      await fuelLog.save();

      res.status(201).json({
        status: 'success',
        data: { fuelLog },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Get all diesel logs.
   */
  static async getAllFuelLogs(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await FuelLog.find().sort({ date: -1 });

      res.status(200).json({
        status: 'success',
        results: logs.length,
        data: { logs },
      });
    } catch (err: any) {
      next(err);
    }
  }
}
