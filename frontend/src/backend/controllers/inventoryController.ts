import { Response, NextFunction } from 'express';
import { Inventory } from '../models/Inventory';
import { Alert } from '../models/Alert';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class InventoryController {
  /**
   * Register a new warehouse inventory item.
   */
  static async createInventoryItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, category, quantity, unit, minThreshold, location, supplier } = req.body;

      if (!name || !category || quantity === undefined || !unit || minThreshold === undefined || !location || !supplier) {
        return next(new BadRequestError('All inventory fields including supplier details are required.'));
      }

      const item = new Inventory({
        name,
        category,
        quantity,
        unit,
        minThreshold,
        location,
        supplier,
      });

      await item.save();

      res.status(201).json({
        status: 'success',
        data: { item },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * List all warehouse inventory items.
   */
  static async getAllInventory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category } = req.query;
      const filter: any = {};
      if (category) {
        filter.category = category;
      }

      const items = await Inventory.find(filter).sort({ name: 1 });

      res.status(200).json({
        status: 'success',
        results: items.length,
        data: { items },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Fetch inventory item profile.
   */
  static async getInventoryById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await Inventory.findById(req.params.id);
      if (!item) {
        return next(new NotFoundError('Inventory item not found'));
      }

      res.status(200).json({
        status: 'success',
        data: { item },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Adjust inventory quantities (handles consumption & restock). Automatically triggers warning alerts.
   */
  static async updateInventoryQuantity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, action } = req.body; // action: 'RESTOCK' or 'CONSUME'

      if (amount === undefined || !action) {
        return next(new BadRequestError('Adjustment amount and transaction action are required.'));
      }

      const item = await Inventory.findById(req.params.id);
      if (!item) {
        return next(new NotFoundError('Inventory item not found'));
      }

      if (action === 'RESTOCK') {
        item.quantity += amount;
        item.lastRestocked = new Date();
      } else {
        // CONSUME
        if (item.quantity < amount) {
          return next(new BadRequestError(`Insufficient stock level. Active count: ${item.quantity} ${item.unit}. Requested: ${amount} ${item.unit}`));
        }
        item.quantity -= amount;
      }

      await item.save();

      // Trigger automatic warning alert if current quantity goes below safety limits
      if (item.quantity <= item.minThreshold) {
        const inventoryAlert = new Alert({
          title: `LOW STOCK HAZARD: ${item.name.toUpperCase()}`,
          message: `Warehouse inventory for ${item.name} has fallen to ${item.quantity} ${item.unit} (Minimum threshold: ${item.minThreshold} ${item.unit}). Please restock.`,
          severity: 'Medium',
          type: 'Inventory',
          mineId: item.location ? undefined : undefined, // generic warehouse alert
        } as any);
        
        // Find an active mine site if location matches a site, otherwise save generic
        await inventoryAlert.save();
      }

      res.status(200).json({
        status: 'success',
        data: { item },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Completely remove an inventory item listing.
   */
  static async deleteInventoryItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await Inventory.findByIdAndDelete(req.params.id);
      if (!item) {
        return next(new NotFoundError('Inventory item not found'));
      }

      res.status(200).json({
        status: 'success',
        message: 'Inventory item successfully deleted from warehouse register.',
      });
    } catch (err: any) {
      next(err);
    }
  }
}
