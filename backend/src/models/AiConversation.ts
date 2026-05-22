import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface IAiConversation extends Document {
  userId: Types.ObjectId;
  messages: IMessage[];
  context?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'model'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const AiConversationSchema = new Schema<IAiConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
    context: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const AiConversation = model<IAiConversation>('AiConversation', AiConversationSchema);
