import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  images: string[];
  categoryId: Types.ObjectId;
  vendorId: Types.ObjectId;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    images: { type: [String], default: [] },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);
