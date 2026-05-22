import { Schema, model, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  workerId: Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'Present' | 'Absent' | 'On Leave' | 'Late';
  shift: 'Morning' | 'Evening' | 'Night';
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    checkIn: Date,
    checkOut: Date,
    status: {
      type: String,
      enum: ['Present', 'Absent', 'On Leave', 'Late'],
      default: 'Present',
      index: true,
    },
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Night'],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index so that a worker can only have one attendance log per calendar date
AttendanceSchema.index({ workerId: 1, date: 1 }, { unique: true });

export const Attendance = model<IAttendance>('Attendance', AttendanceSchema);
