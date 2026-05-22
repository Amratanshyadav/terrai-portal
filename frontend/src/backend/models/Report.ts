import { Schema, model, Document, Types } from 'mongoose';

export interface IReport extends Document {
  title: string;
  type: 'Production' | 'Safety' | 'Maintenance' | 'Environmental' | 'Inventory' | 'Audit';
  url: string; // Cloudinary secure storage link or local file path
  generatedBy: Types.ObjectId; // User Ref
  aiSummary?: string; // AI generated executive summary of this report
  parameters?: Record<string, any>; // Date range, selected zones etc.
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Production', 'Safety', 'Maintenance', 'Environmental', 'Inventory', 'Audit'],
      required: [true, 'Report type is required'],
      index: true,
    },
    url: {
      type: String,
      required: [true, 'Report URL path is required'],
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    aiSummary: {
      type: String,
      default: '',
    },
    parameters: {
      type: Schema.Types.Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Report = model<IReport>('Report', ReportSchema);
