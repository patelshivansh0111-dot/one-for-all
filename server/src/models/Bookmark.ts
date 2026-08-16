import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBookmark extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  post: Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, createdAt: -1 });

const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
export default Bookmark;
