import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAIRecommendation extends Document {
  _id: Types.ObjectId;
  question?: Types.ObjectId;
  user?: Types.ObjectId;
  recommendedUsers: Types.ObjectId[];
  scores: number[];
  reason: string;
  createdAt: Date;
}

const aiRecommendationSchema = new Schema<IAIRecommendation>(
  {
    question: { type: Schema.Types.ObjectId, ref: 'Question' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    recommendedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    scores: [{ type: Number }],
    reason: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

aiRecommendationSchema.index({ question: 1, createdAt: -1 });
aiRecommendationSchema.index({ user: 1, createdAt: -1 });

const AIRecommendation = mongoose.model<IAIRecommendation>(
  'AIRecommendation',
  aiRecommendationSchema
);
export default AIRecommendation;
