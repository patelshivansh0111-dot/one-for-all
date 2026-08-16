import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAnswer extends Document {
  _id: Types.ObjectId;
  question: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  helpfulCount: number;
  isBestAnswer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 10000 },
    helpfulCount: { type: Number, default: 0 },
    isBestAnswer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

answerSchema.index({ question: 1, createdAt: 1 });
answerSchema.index({ author: 1, createdAt: -1 });

const Answer = mongoose.model<IAnswer>('Answer', answerSchema);
export default Answer;
