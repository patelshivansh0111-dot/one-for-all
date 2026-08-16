import mongoose, { Document, Schema, Types } from 'mongoose';

export type MemberRole = 'member' | 'moderator' | 'admin';

export interface ICommunityMember {
  user: Types.ObjectId;
  role: MemberRole;
  joinedAt: Date;
}

export interface IAnnouncement {
  title: string;
  content: string;
  createdAt: Date;
  author: Types.ObjectId;
}

export interface ICommunity extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  banner?: string;
  logo?: string;
  rules: string[];
  tags: string[];
  categories: string[];
  creator: Types.ObjectId;
  admins: Types.ObjectId[];
  moderators: Types.ObjectId[];
  members: ICommunityMember[];
  isPrivate: boolean;
  inviteCode?: string;
  pinnedPosts: Types.ObjectId[];
  announcements: IAnnouncement[];
  gallery: string[];
  memberCount: number;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const communitySchema = new Schema<ICommunity>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '', maxlength: 2000 },
    banner: { type: String, default: '' },
    logo: { type: String, default: '' },
    rules: [{ type: String }],
    tags: [{ type: String, trim: true }],
    categories: [{ type: String, trim: true }],
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    moderators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['member', 'moderator', 'admin'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    isPrivate: { type: Boolean, default: false },
    inviteCode: { type: String },
    pinnedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    announcements: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      },
    ],
    gallery: [{ type: String }],
    memberCount: { type: Number, default: 1 },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

communitySchema.index({ slug: 1 });
communitySchema.index({ tags: 1 });
communitySchema.index({ name: 'text', description: 'text', tags: 'text' });

const Community = mongoose.model<ICommunity>('Community', communitySchema);
export default Community;
