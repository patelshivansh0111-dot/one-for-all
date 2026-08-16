import mongoose, { Document, Schema, Types } from 'mongoose';

export type PostType =
  | 'text'
  | 'image'
  | 'video'
  | 'poll'
  | 'document'
  | 'code'
  | 'question'
  | 'link';

export interface IPollOption {
  text: string;
  votes: Types.ObjectId[];
}

export interface IMediaItem {
  url: string;
  type: 'image' | 'video' | 'document';
  filename?: string;
}

export interface IPost extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  community?: Types.ObjectId;
  type: PostType;
  title?: string;
  content: string;
  markdown?: string;
  media: IMediaItem[];
  codeLanguage?: string;
  codeContent?: string;
  pollOptions: IPollOption[];
  linkUrl?: string;
  hashtags: string[];
  mentions: Types.ObjectId[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  bookmarksCount: number;
  trendingScore: number;
  isPinned: boolean;
  isAnnouncement: boolean;
  isReported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    community: { type: Schema.Types.ObjectId, ref: 'Community' },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'poll', 'document', 'code', 'question', 'link'],
      default: 'text',
    },
    title: { type: String, maxlength: 300 },
    content: { type: String, required: true },
    markdown: { type: String },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video', 'document'], default: 'image' },
        filename: { type: String },
      },
    ],
    codeLanguage: { type: String },
    codeContent: { type: String },
    pollOptions: [
      {
        text: { type: String, required: true },
        votes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      },
    ],
    linkUrl: { type: String },
    hashtags: [{ type: String, lowercase: true, trim: true }],
    mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isAnnouncement: { type: Boolean, default: false },
    isReported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ trendingScore: -1 });
postSchema.index({ title: 'text', content: 'text', hashtags: 'text' });

const Post = mongoose.model<IPost>('Post', postSchema);
export default Post;
