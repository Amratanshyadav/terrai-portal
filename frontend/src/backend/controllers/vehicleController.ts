import { Response, NextFunction } from 'express';
import { VehicleLog } from '../models/VehicleLog';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class VehicleController {
  /**
   * Record a vehicle check-in (coming).
   */
  static async checkInVehicle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vehicleNumber, driverName, checkInTime } = req.body;

      if (!vehicleNumber || !driverName) {
        return next(new BadRequestError('Vehicle number and driver name are required.'));
      }

      // Optional: Check if the vehicle is already checked in and not checked out
      const activeLog = await VehicleLog.findOne({ 
        vehicleNumber: vehicleNumber.toUpperCase(), 
        status: 'In' 
      });
      if (activeLog) {
        return next(new BadRequestError('Vehicle is already checked in and has not checked out yet.'));
      }

      const vehicleLog = new VehicleLog({
        vehicleNumber: vehicleNumber.toUpperCase(),
        driverName,
        checkInTime: checkInTime || new Date(),
        status: 'In',
      });

      await vehicleLog.save();

      res.status(201).json({
        status: 'success',
        data: { vehicleLog },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Record a vehicle check-out (going).
   */
  static async checkOutVehicle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { logId, checkOutTime } = req.body;

      if (!logId) {
        return next(new BadRequestError('Log ID is required for check-out.'));
      }

      const vehicleLog = await VehicleLog.findById(logId);
      if (!vehicleLog) {
        return next(new NotFoundError('Vehicle log not found.'));
      }

      if (vehicleLog.status === 'Out') {
        return next(new BadRequestError('Vehicle has already checked out.'));
      }

      vehicleLog.checkOutTime = checkOutTime || new Date();
      vehicleLog.status = 'Out';
      await vehicleLog.save();

      res.status(200).json({
        status: 'success',
        data: { vehicleLog },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Get all vehicle movement logs.
   */
  static async getAllVehicleLogs(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await VehicleLog.find().sort({ checkInTime: -1 });

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
