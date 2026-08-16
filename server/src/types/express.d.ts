import { Request } from 'express';
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId;
      name: string;
      username: string;
      email: string;
      avatar?: string;
      role: 'user' | 'moderator' | 'admin';
      following: Types.ObjectId[];
      followers: Types.ObjectId[];
      communities: Types.ObjectId[];
      blockedUsers: Types.ObjectId[];
      isBanned: boolean;
      banReason?: string;
      xp: number;
      level: number;
      dailyStreak: number;
      badges: string[];
      achievements: Types.ObjectId[];
      privacy: {
        profileVisibility: 'public' | 'followers' | 'private';
        showEmail: boolean;
        showLocation: boolean;
        allowMessages: 'everyone' | 'followers' | 'none';
      };
      notificationSettings: {
        email: boolean;
        push: boolean;
        likes: boolean;
        comments: boolean;
        follows: boolean;
        messages: boolean;
        events: boolean;
      };
    }
  }
}

export interface AuthRequest extends Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}

export {};
