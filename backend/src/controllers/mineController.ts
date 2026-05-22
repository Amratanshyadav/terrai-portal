import { Response, NextFunction } from 'express';
import { Mine } from '../models/Mine';
import { Alert } from '../models/Alert';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class MineController {
  /**
   * Register a new mine site.
   */
  static async createMine(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, location, productionTarget, zones } = req.body;

      if (!name || !location || productionTarget === undefined) {
        return next(new BadRequestError('Name, location, and production target are required.'));
      }

      const mine = new Mine({
        name,
        location,
        productionTarget,
        zones: zones || [],
      });

      await mine.save();

      res.status(201).json({
        status: 'success',
        data: { mine },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * List all mining operations (supports status filters).
   */
  static async getAllMines(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query;
      const filter: any = {};
      if (status) {
        filter.status = status;
      }

      const mines = await Mine.find(filter).sort({ name: 1 });

      res.status(200).json({
        status: 'success',
        results: mines.length,
        data: { mines },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Fetch mine profile details.
   */
  static async getMineById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const mine = await Mine.findById(req.params.id);
      if (!mine) {
        return next(new NotFoundError('Mine location not found'));
      }

      res.status(200).json({
        status: 'success',
        data: { mine },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Update environmental telemetries. Generates safety alerts if thresholds are breached.
   */
  static async updateEnvironmentalData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { aqi, temperature, humidity, methane, carbonMonoxide, noiseLevel } = req.body;
      const mine = await Mine.findById(req.params.id);

      if (!mine) {
        return next(new NotFoundError('Mine location not found'));
      }

      // Update values
      mine.environmentalData = {
        aqi: aqi !== undefined ? aqi : mine.environmentalData.aqi,
        temperature: temperature !== undefined ? temperature : mine.environmentalData.temperature,
        humidity: humidity !== undefined ? humidity : mine.environmentalData.humidity,
        methane: methane !== undefined ? methane : mine.environmentalData.methane,
        carbonMonoxide: carbonMonoxide !== undefined ? carbonMonoxide : mine.environmentalData.carbonMonoxide,
        noiseLevel: noiseLevel !== undefined ? noiseLevel : mine.environmentalData.noiseLevel,
        lastUpdated: new Date(),
      };

      await mine.save();

      // Trigger automatic safety alerts if gas thresholds are breached
      // 1. Methane threshold check (> 1.0% volume equivalent in ppm/safety metrics)
      if (mine.environmentalData.methane > 1.0) {
        const gasAlert = new Alert({
          title: 'CRITICAL METHANE BREACH',
          message: `Elevated methane concentrations of ${mine.environmentalData.methane}% volume detected in ${mine.name}. Evacuate face.`,
          severity: 'Critical',
          type: 'Environmental',
          mineId: mine._id,
        });
        await gasAlert.save();
      }

      // 2. Carbon Monoxide threshold check (> 35 ppm)
      if (mine.environmentalData.carbonMonoxide > 35) {
        const coAlert = new Alert({
          title: 'HIGH CARBON MONOXIDE ALERT',
          message: `Toxic Carbon Monoxide values reached ${mine.environmentalData.carbonMonoxide} ppm in ${mine.name}. Inspect auxiliary ventilation fans.`,
          severity: 'High',
          type: 'Environmental',
          mineId: mine._id,
        });
        await coAlert.save();
      }

      res.status(200).json({
        status: 'success',
        data: { environmentalData: mine.environmentalData },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Update general mine particulars.
   */
  static async updateMine(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const mine = await Mine.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!mine) {
        return next(new NotFoundError('Mine location not found'));
      }

      res.status(200).json({
        status: 'success',
        data: { mine },
      });
    } catch (err: any) {
      next(err);
    }
  }
}
