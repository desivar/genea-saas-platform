import { Schema, model, Document } from 'mongoose';

// Define the shape of a User document for TypeScript
export interface IUser extends Document {
  name: string;
  email: string;
  isEmailVerified?: boolean;
  emailVerificationToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  passwordHash: string;
  avatar?: string;
  treeIds?: Schema.Types.ObjectId[];
  lastLoginAt?: Date;
  accountTier: 'free' | 'premium';
  donationLinkClicks: number;
  createdAt: Date;
  updatedAt: Date;
}

// Build the Mongoose database blueprint
const UserSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  emailVerificationToken: { 
    type: String 
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  avatar: {
    type: String
  },
  accountTier: { 
    type: String, 
    enum: ['free', 'premium'], 
    default: 'free' 
  },
  donationLinkClicks: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true // Automatically generates and updates createdAt / updatedAt fields
});

export const User = model<IUser>('User', UserSchema);