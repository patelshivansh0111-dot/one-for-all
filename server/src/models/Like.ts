import mongoose, { Document, Schema, Types } from 'mongoose';

export type LikeTargetType = 'post' | 'comment' | 'question' | 'answer';

export interface ILike extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  targetType: LikeTargetType;
  targetId: Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: {
      type: String,
      enum: ['post', 'comment', 'question', 'answer'],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
likeSchema.index({ targetType: 1, targetId: 1 });

const Like = mongoose.model<ILike>('Like', likeSchema);
export default Like;
