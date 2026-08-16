import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  parentComment?: Types.ObjectId;
  likesCount: number;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

const Comment = mongoose.model<IComment>('Comment', commentSchema);
export default Comment;
