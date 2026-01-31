import mongoose, { Schema, Document, Types } from 'mongoose';

export type UploadType = 'profile' | 'product';

export interface IUpload extends Document {
  userId: Types.ObjectId;
  path: string; // public path like /uploads/filename.ext
  type: UploadType;
}

const uploadSchema = new Schema<IUpload>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    path: { type: String, required: true },
    type: { type: String, enum: ['profile', 'product'], required: true },
  },
  { timestamps: true }
);

export const Upload = mongoose.model<IUpload>('Upload', uploadSchema);
