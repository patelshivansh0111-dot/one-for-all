import { Types } from 'mongoose';
import User from '../models/User';
import Post from '../models/Post';
import Comment from '../models/Comment';
import Achievement from '../models/Achievement';
import Notification from '../models/Notification';

const XP_PER_LEVEL = 100;

export const calculateLevel = (xp: number): number => Math.floor(xp / XP_PER_LEVEL) + 1;

export const addXP = async (userId: Types.ObjectId, amount: number): Promise<void> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { xp: amount } },
    { new: true }
  );
  if (!user) return;

  const newLevel = calculateLevel(user.xp);
  if (newLevel !== user.level) {
    user.level = newLevel;
    await user.save();
  }
};

export const updateDailyStreak = async (userId: Types.ObjectId): Promise<number> => {
  const user = await User.findById(userId);
  if (!user) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (user.lastActiveDate) {
    const lastActive = new Date(user.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return user.dailyStreak;
    if (diffDays === 1) user.dailyStreak += 1;
    else user.dailyStreak = 1;
  } else {
    user.dailyStreak = 1;
  }

  user.lastActiveDate = new Date();
  await user.save();
  return user.dailyStreak;
};

export const checkAndAwardAchievements = async (userId: Types.ObjectId): Promise<string[]> => {
  const user = await User.findById(userId).populate('achievements');
  if (!user) return [];

  const achievements = await Achievement.find();
  const awarded: string[] = [];
  const existingIds = new Set(user.achievements.map((a) => a.toString()));

  for (const achievement of achievements) {
    if (existingIds.has(achievement._id.toString())) continue;

    let earned = false;
    const { type, threshold } = achievement.criteria;

    switch (type) {
      case 'posts': {
        const count = await Post.countDocuments({ author: userId });
        earned = count >= threshold;
        break;
      }
      case 'comments': {
        const count = await Comment.countDocuments({ author: userId });
        earned = count >= threshold;
        break;
      }
      case 'followers': {
        earned = user.followers.length >= threshold;
        break;
      }
      case 'xp': {
        earned = user.xp >= threshold;
        break;
      }
      case 'streak': {
        earned = user.dailyStreak >= threshold;
        break;
      }
      case 'level': {
        earned = user.level >= threshold;
        break;
      }
      default:
        break;
    }

    if (earned) {
      user.achievements.push(achievement._id);
      user.badges.push(achievement.key);
      await addXP(userId, achievement.xpReward);
      awarded.push(achievement.key);

      await Notification.create({
        recipient: userId,
        type: 'announcement',
        title: 'Achievement Unlocked!',
        body: `You earned "${achievement.name}" — ${achievement.description}`,
        link: '/achievements',
      });
    }
  }

  if (awarded.length > 0) await user.save();
  return awarded;
};

export const seedDefaultAchievements = async (): Promise<void> => {
  const defaults = [
    { key: 'first_post', name: 'First Post', description: 'Create your first post', icon: '✍️', xpReward: 25, criteria: { type: 'posts', threshold: 1 } },
    { key: 'prolific', name: 'Prolific Writer', description: 'Create 10 posts', icon: '📝', xpReward: 100, criteria: { type: 'posts', threshold: 10 } },
    { key: 'conversationalist', name: 'Conversationalist', description: 'Leave 25 comments', icon: '💬', xpReward: 75, criteria: { type: 'comments', threshold: 25 } },
    { key: 'popular', name: 'Popular', description: 'Gain 10 followers', icon: '⭐', xpReward: 150, criteria: { type: 'followers', threshold: 10 } },
    { key: 'streak_7', name: 'Week Warrior', description: '7-day activity streak', icon: '🔥', xpReward: 100, criteria: { type: 'streak', threshold: 7 } },
    { key: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '🌟', xpReward: 200, criteria: { type: 'level', threshold: 5 } },
  ];

  for (const ach of defaults) {
    await Achievement.findOneAndUpdate({ key: ach.key }, ach, { upsert: true });
  }
};

export const getLeaderboard = async (limit = 20) => {
  return User.find({ isBanned: false })
    .select('name username avatar xp level dailyStreak badges')
    .sort({ xp: -1 })
    .limit(limit);
};
