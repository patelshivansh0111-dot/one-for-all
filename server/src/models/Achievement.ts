import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievementCriteria {
  type: string;
  threshold: number;
  field?: string;
}

export interface IAchievement extends Document {
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  criteria: IAchievementCriteria;
  createdAt: Date;
  updatedAt: Date;
}

const achievementSchema = new Schema<IAchievement>(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🏆' },
    xpReward: { type: Number, default: 50 },
    criteria: {
      type: { type: String, required: true },
      threshold: { type: Number, required: true },
      field: { type: String },
    },
  },
  { timestamps: true }
);

const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema);
export default Achievement;
