import { Schema, model, Document, Types } from 'mongoose';

export interface ITelemetry {
  temperature: number;      // °C
  vibration: number;        // mm/s
  pressure: number;         // bar
  oilLevel: number;         // percentage
  lastTelemetryUpdate: Date;
}

export interface IMachine extends Document {
  name: string;
  serialNumber: string;
  type: 'Excavator' | 'Haul Truck' | 'Drill' | 'Loader' | 'Conveyor' | 'Crusher';
  status: 'Operational' | 'Maintenance' | 'Down';
  mineId: Types.ObjectId;
  assignedWorkerId?: Types.ObjectId;
  fuelCapacity: number;     // in Liters
  fuelLevel: number;        // in Liters
  hoursRun: number;         // lifetime engine hours
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  telemetry: ITelemetry;
  createdAt: Date;
  updatedAt: Date;
}

const TelemetrySchema = new Schema<ITelemetry>({
  temperature: { type: Number, default: 65 },
  vibration: { type: Number, default: 2.1 },
  pressure: { type: Number, default: 3.5 },
  oilLevel: { type: Number, default: 95 },
  lastTelemetryUpdate: { type: Date, default: Date.now },
}, { _id: false });

const MachineSchema = new Schema<IMachine>(
  {
    name: {
      type: String,
      required: [true, 'Machine name is required'],
      trim: true,
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['Excavator', 'Haul Truck', 'Drill', 'Loader', 'Conveyor', 'Crusher'],
      required: [true, 'Machine type is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['Operational', 'Maintenance', 'Down'],
      default: 'Operational',
      index: true,
    },
    mineId: {
      type: Schema.Types.ObjectId,
      ref: 'Mine',
      required: [true, 'Mine assignment is required'],
      index: true,
    },
    assignedWorkerId: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      index: true,
    },
    fuelCapacity: {
      type: Number,
      required: [true, 'Fuel capacity is required'],
      min: [0, 'Capacity cannot be negative'],
    },
    fuelLevel: {
      type: Number,
      required: [true, 'Fuel level is required'],
      min: [0, 'Fuel level cannot be negative'],
      validate: {
        validator: function (this: IMachine, val: number) {
          return val <= this.fuelCapacity;
        },
        message: 'Fuel level cannot exceed capacity',
      },
    },
    hoursRun: {
      type: Number,
      default: 0,
      min: [0, 'Hours run cannot be negative'],
    },
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date,
    telemetry: {
      type: TelemetrySchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

export const Machine = model<IMachine>('Machine', MachineSchema);
