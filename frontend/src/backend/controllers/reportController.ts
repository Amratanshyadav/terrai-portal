import { Response, NextFunction } from 'express';
import { Report } from '../models/Report';
import { Mine } from '../models/Mine';
import { Worker } from '../models/Worker';
import { Machine } from '../models/Machine';
import { Alert } from '../models/Alert';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { AiClient } from '../utils/aiClient';

export class ReportController {
  /**
   * Generates a new operational report and calls AI to summarize the contents.
   */
  static async createReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, type, mineId } = req.body;

      if (!title || !type) {
        return next(new BadRequestError('Report title and operational category are required.'));
      }

      // Gather current domain details to formulate the data summary payload
      const dataset: any = {
        timestamp: new Date(),
        scope: mineId ? `Mine Site: ${mineId}` : 'All Operations',
      };

      if (mineId) {
        dataset.mineDetails = await Mine.findById(mineId);
        dataset.activeWorkers = await Worker.find({ mineId, status: 'Active' }).select('firstName lastName role');
        dataset.machinesTelemetry = await Machine.find({ mineId }).select('name status telemetry hoursRun');
        dataset.recentAlerts = await Alert.find({ mineId, status: 'Active' }).limit(5);
      } else {
        dataset.totalMinesCount = await Mine.countDocuments();
        dataset.totalActiveWorkers = await Worker.countDocuments({ status: 'Active' });
        dataset.downMachineryCount = await Machine.countDocuments({ status: 'Down' });
        dataset.activeAlertsCount = await Alert.countDocuments({ status: 'Active' });
      }

      // Call AI microservice to summarize the raw dataset
      const summaryText = await AiClient.summarizeReport(type, dataset);

      // Create Report Document
      const report = new Report({
        title,
        type,
        url: `https://res.cloudinary.com/mines-management/raw/upload/reports/${Date.now()}_report.csv`, // mock Cloudinary file path
        generatedBy: req.user?.id,
        aiSummary: summaryText,
        parameters: { mineId },
      });

      await report.save();

      res.status(201).json({
        status: 'success',
        data: { report },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Get all reports with optional type query filters.
   */
  static async getAllReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.query;
      const filter: any = {};
      if (type) {
        filter.type = type;
      }

      const reports = await Report.find(filter)
        .populate('generatedBy', 'firstName lastName email')
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: 'success',
        results: reports.length,
        data: { reports },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Fetch specific report details and AI generated summaries.
   */
  static async getReportById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await Report.findById(req.params.id).populate('generatedBy', 'firstName lastName email');
      if (!report) {
        return next(new NotFoundError('Report document not found'));
      }

      res.status(200).json({
        status: 'success',
        data: { report },
      });
    } catch (err: any) {
      next(err);
    }
  }
}
