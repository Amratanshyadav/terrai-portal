import { Schema, model, Document, Types } from 'mongoose';

export interface IMaintenanceLog extends Document {
  machineId: Types.ObjectId;
  type: 'Routine' | 'Breakdown' | 'Predictive';
  description: string;
  cost: number;
  performedBy: string; // Name of mechanic or service company
  date: Date;
  downtimeHours: number; // Duration in hours machine was offline
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceLogSchema = new Schema<IMaintenanceLog>(
  {
    machineId: {
      type: Schema.Types.ObjectId,
      ref: 'Machine',
      required: [true, 'Machine ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['Routine', 'Breakdown', 'Predictive'],
      required: [true, 'Maintenance type is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description of maintenance is required'],
      trim: true,
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    performedBy: {
      type: String,
      required: [true, 'Technician / operator name is required'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    downtimeHours: {
      type: Number,
      default: 0,
      min: [0, 'Downtime cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

export const MaintenanceLog = model<IMaintenanceLog>('MaintenanceLog', MaintenanceLogSchema);
