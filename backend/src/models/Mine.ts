import { Schema, model, Document } from 'mongoose';

export interface IEnvironmentalData {
  aqi: number;
  temperature: number;
  humidity: number;
  methane: number;          // ppm
  carbonMonoxide: number;   // ppm
  noiseLevel: number;       // dB
  lastUpdated: Date;
}

export interface IMine extends Document {
  name: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  zones: string[];
  environmentalData: IEnvironmentalData;
  productionTarget: number; // in metric tons per month
  actualProduction: number;   // total accumulated production (tons)
  createdAt: Date;
  updatedAt: Date;
}

const EnvironmentalDataSchema = new Schema<IEnvironmentalData>({
  aqi: { type: Number, default: 50 },
  temperature: { type: Number, default: 22 },
  humidity: { type: Number, default: 45 },
  methane: { type: Number, default: 0.05 },
  carbonMonoxide: { type: Number, default: 1.2 },
  noiseLevel: { type: Number, default: 72 },
  lastUpdated: { type: Date, default: Date.now },
}, { _id: false });

const MineSchema = new Schema<IMine>(
  {
    name: {
      type: String,
      required: [true, 'Mine name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location coordinates or region are required'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Maintenance'],
      default: 'Active',
    },
    zones: {
      type: [String],
      default: [],
    },
    environmentalData: {
      type: EnvironmentalDataSchema,
      default: () => ({}),
    },
    productionTarget: {
      type: Number,
      required: [true, 'Monthly target is required'],
      min: [0, 'Target cannot be negative'],
    },
    actualProduction: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Mine = model<IMine>('Mine', MineSchema);
