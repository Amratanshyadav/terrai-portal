import { Schema, model, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  workerId: Types.ObjectId;
  amount: number;
  date: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      required: [true, 'Worker ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: 'Monthly Salary',
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = model<IPayment>('Payment', PaymentSchema);
