import { Schema, model, Document } from 'mongoose';

export type UserRole = 'admin' | 'genealogist' | 'user';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  accountTier: 'free' | 'premium';
  role: UserRole;
  donationLinkClicks: number;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  accountTier: { type: String, enum: ['free', 'premium'], default: 'free' },
  role: { type: String, enum: ['admin', 'genealogist', 'user'], default: 'user' },
  donationLinkClicks: { type: Number, default: 0 },
  isEmailVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
}, {
  timestamps: true
});

UserSchema.index({ email: 1 });

export const User = model<IUser>('User', UserSchema);