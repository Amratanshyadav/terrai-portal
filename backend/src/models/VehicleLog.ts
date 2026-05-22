import { Schema, model, Document } from 'mongoose';

export interface IVehicleLog extends Document {
  vehicleNumber: string;
  driverName: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: 'In' | 'Out';
  createdAt: Date;
  updatedAt: Date;
}

const VehicleLogSchema = new Schema<IVehicleLog>(
  {
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    driverName: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true,
    },
    checkInTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    checkOutTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['In', 'Out'],
      default: 'In',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const VehicleLog = model<IVehicleLog>('VehicleLog', VehicleLogSchema);
