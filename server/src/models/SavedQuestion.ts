import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISavedQuestion extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  question: Types.ObjectId;
  createdAt: Date;
}

const savedQuestionSchema = new Schema<ISavedQuestion>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

savedQuestionSchema.index({ user: 1, question: 1 }, { unique: true });
savedQuestionSchema.index({ user: 1, createdAt: -1 });

const SavedQuestion = mongoose.model<ISavedQuestion>('SavedQuestion', savedQuestionSchema);
export default SavedQuestion;
