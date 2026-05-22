import { Response, NextFunction } from 'express';
import { Worker } from '../models/Worker';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class WorkerController {
  /**
   * Register a new worker/employee.
   */
  static async createWorker(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firstName, phone, post, salary } = req.body;

      if (!firstName || !phone || !post || salary === undefined) {
        return next(new BadRequestError('First name, phone, post, and salary are required.'));
      }

      const worker = new Worker({
        firstName,
        phone,
        post,
        salary,
      });

      await worker.save();

      res.status(201).json({
        status: 'success',
        data: { worker },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * List all workers.
   */
  static async getAllWorkers(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workers = await Worker.find().sort({ createdAt: -1 });

      res.status(200).json({
        status: 'success',
        results: workers.length,
        data: { workers },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Fetch worker details.
   */
  static async getWorkerById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const worker = await Worker.findById(req.params.id);
      if (!worker) {
        return next(new NotFoundError('Worker not found'));
      }

      res.status(200).json({
        status: 'success',
        data: { worker },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Edit worker details.
   */
  static async updateWorker(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!worker) {
        return next(new NotFoundError('Worker not found'));
      }

      res.status(200).json({
        status: 'success',
        data: { worker },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Delete a worker.
   */
  static async deleteWorker(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const worker = await Worker.findByIdAndDelete(req.params.id);
      if (!worker) {
        return next(new NotFoundError('Worker not found'));
      }

      res.status(200).json({
        status: 'success',
        message: 'Worker deleted successfully.',
      });
    } catch (err: any) {
      next(err);
    }
  }
}
