import { Response, NextFunction } from 'express';
import { Machine } from '../models/Machine';
import { FuelLog } from '../models/FuelLog';
import { MaintenanceLog } from '../models/MaintenanceLog';
import { Alert } from '../models/Alert';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { AiClient } from '../utils/aiClient';

export class MachineController {
  /**
   * Register a new heavy machine.
   */
  static async createMachine(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, serialNumber, type, mineId, fuelCapacity } = req.body;

      if (!name || !serialNumber || !type || !mineId || !fuelCapacity) {
        return next(new BadRequestError('Name, serial number, type, mine, and fuel capacity are required.'));
      }

      const machine = new Machine({
        name,
        serialNumber,
        type,
        mineId,
        fuelCapacity,
        fuelLevel: fuelCapacity, // Start fully fueled
      });

      await machine.save();

      res.status(201).json({
        status: 'success',
        data: { machine },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * List all machines with pagination and filters.
   */
  static async getAllMachines(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, status, mineId } = req.query;
      const filter: any = {};

      if (type) filter.type = type;
      if (status) filter.status = status;
      if (mineId) filter.mineId = mineId;

      const machines = await Machine.find(filter)
        .populate('mineId', 'name')
        .populate('assignedWorkerId', 'firstName lastName')
        .sort({ name: 1 });

      res.status(200).json({
        status: 'success',
        results: machines.length,
        data: { machines },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Get specific machine telemetry and scheduling data.
   */
  static async getMachineById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const machine = await Machine.findById(req.params.id)
        .populate('mineId', 'name')
        .populate('assignedWorkerId', 'firstName lastName');

      if (!machine) {
        return next(new NotFoundError('Machine not found'));
      }

      res.status(200).json({
        status: 'success',
        data: { machine },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Receive live sensor parameters and run AI breakdown prediction algorithms.
   */
  static async updateTelemetry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { temperature, vibration, pressure, oilLevel, hoursRun } = req.body;
      const machine = await Machine.findById(req.params.id);

      if (!machine) {
        return next(new NotFoundError('Machine not found'));
      }

      // Update basic fields
      machine.telemetry = {
        temperature: temperature !== undefined ? temperature : machine.telemetry.temperature,
        vibration: vibration !== undefined ? vibration : machine.telemetry.vibration,
        pressure: pressure !== undefined ? pressure : machine.telemetry.pressure,
        oilLevel: oilLevel !== undefined ? oilLevel : machine.telemetry.oilLevel,
        lastTelemetryUpdate: new Date(),
      };

      if (hoursRun !== undefined) {
        machine.hoursRun = hoursRun;
      }

      // Run ML predictive maintenance inference
      const prediction = await AiClient.predictMaintenance(
        machine.telemetry.temperature,
        machine.telemetry.vibration,
        machine.telemetry.pressure,
        machine.telemetry.oilLevel,
        machine.hoursRun
      );

      // If AI detects critical breakdown threat, flag machine and generate safety alert
      if (prediction.riskLevel === 'High') {
        machine.status = 'Maintenance';
        
        const machineAlert = new Alert({
          title: `PREDICTIVE DOWNTIME HAZARD: ${machine.name.toUpperCase()}`,
          message: `AI predicted ${prediction.breakdownProbability}% failure likelihood for machine ${machine.name} (SN: ${machine.serialNumber}). Primary triggers: ${prediction.primaryTriggers.join(', ')}. Action: ${prediction.recommendation}`,
          severity: 'High',
          type: 'Machine',
          mineId: machine.mineId,
          machineId: machine._id,
        });
        await machineAlert.save();
      }

      await machine.save();

      res.status(200).json({
        status: 'success',
        data: {
          machine,
          aiPrediction: prediction,
        },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Log refuel event for a machine.
   */
  static async recordFuelLog(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, cost } = req.body;
      const machine = await Machine.findById(req.params.id);

      if (!machine) {
        return next(new NotFoundError('Machine not found'));
      }

      if (!amount || !cost) {
        return next(new BadRequestError('Fuel amount and refueling cost are required.'));
      }

      const fuelLevelBefore = machine.fuelLevel;
      const fuelLevelAfter = Math.min(machine.fuelCapacity, machine.fuelLevel + amount);

      // Save Fuel Log
      const fuelLog = new FuelLog({
        machineId: machine._id,
        amount,
        cost,
        loggedById: req.user?.id,
        fuelLevelBefore,
        fuelLevelAfter,
      });

      await fuelLog.save();

      // Update machine fuel level
      machine.fuelLevel = fuelLevelAfter;
      await machine.save();

      res.status(201).json({
        status: 'success',
        data: { fuelLog, updatedFuelLevel: machine.fuelLevel },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Log a completed maintenance event.
   */
  static async recordMaintenanceLog(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, description, cost, performedBy, downtimeHours } = req.body;
      const machine = await Machine.findById(req.params.id);

      if (!machine) {
        return next(new NotFoundError('Machine not found'));
      }

      if (!type || !description || !cost || !performedBy) {
        return next(new BadRequestError('Service type, description, cost, and technician name are required.'));
      }

      const maintenanceLog = new MaintenanceLog({
        machineId: machine._id,
        type,
        description,
        cost,
        performedBy,
        downtimeHours: downtimeHours || 0,
      });

      await maintenanceLog.save();

      // Reset machine status to Operational since maintenance is complete
      machine.status = 'Operational';
      machine.lastMaintenanceDate = new Date();
      // Set next schedule in 3 months
      machine.nextMaintenanceDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      await machine.save();

      res.status(201).json({
        status: 'success',
        data: { maintenanceLog, machine },
      });
    } catch (err: any) {
      next(err);
    }
  }
}
