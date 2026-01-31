import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'vendor' | 'customer';

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'vendor', 'customer'], default: 'customer' },
    avatar: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
