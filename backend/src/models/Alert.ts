import { Schema, model, Document, Types } from 'mongoose';

export interface IAlert extends Document {
  title: string;
  message: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  type: 'Safety' | 'Machine' | 'Environmental' | 'Inventory';
  status: 'Active' | 'Resolved';
  mineId: Types.ObjectId;
  machineId?: Types.ObjectId;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    title: {
      type: String,
      required: [true, 'Alert title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Alert message is required'],
      trim: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: [true, 'Severity is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['Safety', 'Machine', 'Environmental', 'Inventory'],
      required: [true, 'Alert type is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved'],
      default: 'Active',
      index: true,
    },
    mineId: {
      type: Schema.Types.ObjectId,
      ref: 'Mine',
      required: [true, 'Mine association is required'],
      index: true,
    },
    machineId: {
      type: Schema.Types.ObjectId,
      ref: 'Machine',
      index: true,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    resolvedAt: Date,
  },
  {
    timestamps: true,
  }
);

export const Alert = model<IAlert>('Alert', AlertSchema);
