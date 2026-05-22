import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  action: string; // e.g. LOGIN, UPDATE_USER, DELETE_MACHINE, RESTOCK_EXPLOSIVES
  entity: 'User' | 'Mine' | 'Worker' | 'Machine' | 'Inventory' | 'Alert' | 'Report';
  entityId?: Types.ObjectId;
  details: string; // Detailed JSON payload or description of action
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entity: {
      type: String,
      enum: ['User', 'Mine', 'Worker', 'Machine', 'Inventory', 'Alert', 'Report'],
      required: true,
      index: true,
    },
    entityId: Schema.Types.ObjectId,
    details: {
      type: String,
      required: true,
    },
    ipAddress: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need creation time for audit trails
  }
);

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
