import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  role: 'Admin' | 'Manager' | 'Supervisor' | 'Worker';
  isActive: boolean;
  verified: boolean;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['Admin', 'Manager', 'Supervisor', 'Worker'],
      default: 'Worker',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: {
      type: String,
      index: true,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Pre-save password hashing hook
UserSchema.pre('save', async function (this: any) {
  if (!this.isModified('passwordHash')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  } catch (err: any) {
    throw err;
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

// Safe JSON serialization
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const r = ret as any;
    delete r.passwordHash;
    delete r.passwordResetToken;
    delete r.passwordResetExpires;
    delete r.verificationToken;
    delete r.__v;
    return r;
  },
});

export const User = model<IUser>('User', UserSchema);
