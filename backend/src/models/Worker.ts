import { Schema, model, Document } from 'mongoose';

export interface IWorker extends Document {
  firstName: string; // First name only
  phone: string;
  post: string; // Designation/post
  salary: number; // Base salary
  joinedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkerSchema = new Schema<IWorker>(
  {
    firstName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    post: {
      type: String,
      required: [true, 'Worker post/designation is required'],
      trim: true,
      index: true,
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: 0,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Worker = model<IWorker>('Worker', WorkerSchema);
