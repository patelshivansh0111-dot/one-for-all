export const QUESTION_CATEGORIES = [
  'business',
  'career',
  'sports',
  'education',
  'money',
  'life',
  'startups',
  'skills',
  'freelancing',
  'design',
  'finance',
  'personal-growth',
  'gaming',
  'college',
  'programming',
  'other',
] as const;

export type QuestionCategory = (typeof QUESTION_CATEGORIES)[number];

export const USER_BADGES = [
  'EARLY_HELPER',
  'COMMUNITY_BUILDER',
  'EXPERIENCE_VERIFIED',
  'TOP_CONTRIBUTOR',
  'MENTOR_BY_EXPERIENCE',
] as const;

export type UserBadge = (typeof USER_BADGES)[number];
