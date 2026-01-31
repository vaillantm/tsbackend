import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  createdBy?: Types.ObjectId;
  path: string;
  image?: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    path: { type: String, required: true, unique: true },
    image: String,
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', categorySchema);
