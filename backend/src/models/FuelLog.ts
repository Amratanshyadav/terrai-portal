import { Schema, model, Document } from 'mongoose';

export interface IFuelLog extends Document {
  vehicleNumber: string;
  amount: number; // In Liters
  cost: number;   // Total cost in ₹
  loggedBy: string; // Name of person who logged it
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FuelLogSchema = new Schema<IFuelLog>(
  {
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle name or number is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Diesel amount in liters is required'],
      min: [0, 'Amount cannot be negative'],
    },
    cost: {
      type: Number,
      required: [true, 'Diesel cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    loggedBy: {
      type: String,
      required: [true, 'Logged by name is required'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const FuelLog = model<IFuelLog>('FuelLog', FuelLogSchema);
