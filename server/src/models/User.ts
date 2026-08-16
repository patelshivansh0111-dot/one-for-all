import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'user' | 'moderator' | 'admin';

export interface ISocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

export interface IPrivacySettings {
  profileVisibility: 'public' | 'followers' | 'private';
  showEmail: boolean;
  showLocation: boolean;
  allowMessages: 'everyone' | 'followers' | 'none';
}

export interface INotificationSettings {
  email: boolean;
  push: boolean;
  likes: boolean;
  comments: boolean;
  follows: boolean;
  messages: boolean;
  events: boolean;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  profession?: string;
  headline?: string;
  skills: string[];
  interests: string[];
  experienceTags: string[];
  peopleHelped: number;
  questionsAnswered: number;
  communityRating: number;
  topicsCount: number;
  verifiedExperience: boolean;
  identityVerified: boolean;
  communityTrusted: boolean;
  socialLinks: ISocialLinks;
  website?: string;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  communities: Types.ObjectId[];
  badges: string[];
  achievements: Types.ObjectId[];
  role: UserRole;
  isVerified: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  googleId?: string;
  xp: number;
  level: number;
  dailyStreak: number;
  lastActiveDate?: Date;
  privacy: IPrivacySettings;
  notificationSettings: INotificationSettings;
  blockedUsers: Types.ObjectId[];
  isBanned: boolean;
  banReason?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, select: false, minlength: 6 },
    avatar: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    bio: { type: String, maxlength: 500, default: '' },
    location: { type: String, default: '' },
    profession: { type: String, default: '' },
    headline: { type: String, default: '', maxlength: 120 },
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    experienceTags: [{ type: String, trim: true, lowercase: true }],
    peopleHelped: { type: Number, default: 0 },
    questionsAnswered: { type: Number, default: 0 },
    communityRating: { type: Number, default: 4.5, min: 0, max: 5 },
    topicsCount: { type: Number, default: 0 },
    verifiedExperience: { type: Boolean, default: false },
    identityVerified: { type: Boolean, default: false },
    communityTrusted: { type: Boolean, default: false },
    socialLinks: {
      twitter: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    website: { type: String, default: '' },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    communities: [{ type: Schema.Types.ObjectId, ref: 'Community' }],
    badges: [{ type: String }],
    achievements: [{ type: Schema.Types.ObjectId, ref: 'Achievement' }],
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    googleId: { type: String, sparse: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    dailyStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'followers', 'private'],
        default: 'public',
      },
      showEmail: { type: Boolean, default: false },
      showLocation: { type: Boolean, default: true },
      allowMessages: {
        type: String,
        enum: ['everyone', 'followers', 'none'],
        default: 'everyone',
      },
    },
    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      events: { type: Boolean, default: true },
    },
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isBanned: { type: Boolean, default: false },
    banReason: { type: String },
  },
  { timestamps: true }
);

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ experienceTags: 1 });
userSchema.index({ peopleHelped: -1 });
userSchema.index({ name: 'text', username: 'text', bio: 'text', profession: 'text' });

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
