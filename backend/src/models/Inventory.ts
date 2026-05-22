import { Schema, model, Document } from 'mongoose';

export interface IInventory extends Document {
  name: string;
  category: 'Explosives' | 'Equipment' | 'Safety' | 'Spare Parts' | 'Chemicals';
  quantity: number;
  unit: string; // e.g., kg, pieces, liters, boxes
  minThreshold: number; // Alerts if quantity <= minThreshold
  location: string;
  supplier: {
    name: string;
    contact: string;
  };
  lastRestocked: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    name: {
      type: String,
      required: [true, 'Inventory item name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['Explosives', 'Equipment', 'Safety', 'Spare Parts', 'Chemicals'],
      required: [true, 'Category is required'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      trim: true,
    },
    minThreshold: {
      type: Number,
      required: [true, 'Min threshold is required'],
      min: [0, 'Threshold cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Warehouse location is required'],
      trim: true,
    },
    supplier: {
      name: { type: String, required: true },
      contact: { type: String, required: true },
    },
    lastRestocked: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Inventory = model<IInventory>('Inventory', InventorySchema);
