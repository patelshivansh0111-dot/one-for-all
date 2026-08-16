import mongoose, { Document, Schema, Types } from 'mongoose';
import { QUESTION_CATEGORIES, QuestionCategory } from '../constants/questionCategories';

export type QuestionStatus = 'open' | 'answered' | 'closed';

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  isAnonymous: boolean;
  content: string;
  category: QuestionCategory;
  tags: string[];
  community?: Types.ObjectId;
  answersCount: number;
  helpfulCount: number;
  savesCount: number;
  viewsCount: number;
  status: QuestionStatus;
  location?: string;
  isReported: boolean;
  trendingScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isAnonymous: { type: Boolean, default: false },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    category: {
      type: String,
      enum: QUESTION_CATEGORIES,
      default: 'other',
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    community: { type: Schema.Types.ObjectId, ref: 'Community' },
    answersCount: { type: Number, default: 0 },
    helpfulCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['open', 'answered', 'closed'],
      default: 'open',
    },
    location: { type: String, trim: true },
    isReported: { type: Boolean, default: false },
    trendingScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

questionSchema.index({ category: 1, createdAt: -1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ community: 1, createdAt: -1 });
questionSchema.index({ status: 1, createdAt: -1 });
questionSchema.index({ trendingScore: -1 });
questionSchema.index({ content: 'text', tags: 'text' });

const Question = mongoose.model<IQuestion>('Question', questionSchema);
export default Question;
