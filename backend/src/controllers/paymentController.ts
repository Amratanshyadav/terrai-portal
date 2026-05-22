import { Response, NextFunction } from 'express';
import { Payment } from '../models/Payment';
import { Worker } from '../models/Worker';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class PaymentController {
  /**
   * Log a new payment.
   */
  static async createPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workerId, amount, date, description } = req.body;

      if (!workerId || amount === undefined) {
        return next(new BadRequestError('Worker ID and amount are required.'));
      }

      // Check if worker exists
      const worker = await Worker.findById(workerId);
      if (!worker) {
        return next(new NotFoundError('Worker not found.'));
      }

      const payment = new Payment({
        workerId,
        amount,
        date: date || new Date(),
        description: description || 'Salary Payment',
      });

      await payment.save();

      res.status(201).json({
        status: 'success',
        data: { payment },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Get all payments (ledger history).
   */
  static async getAllPayments(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await Payment.find()
        .populate('workerId', 'firstName post')
        .sort({ date: -1 });

      res.status(200).json({
        status: 'success',
        results: payments.length,
        data: { payments },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Get payments for a specific worker.
   */
  static async getPaymentsByWorker(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await Payment.find({ workerId: req.params.workerId })
        .populate('workerId', 'firstName post')
        .sort({ date: -1 });

      res.status(200).json({
        status: 'success',
        results: payments.length,
        data: { payments },
      });
    } catch (err: any) {
      next(err);
    }
  }
}
