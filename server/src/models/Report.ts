import mongoose, { Document, Schema, Types } from 'mongoose';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface IReport extends Document {
  _id: Types.ObjectId;
  reporter: Types.ObjectId;
  targetType: string;
  targetId: Types.ObjectId;
  reason: string;
  details?: string;
  status: ReportStatus;
  reviewedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    details: { type: String },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });

const Report = mongoose.model<IReport>('Report', reportSchema);
export default Report;
