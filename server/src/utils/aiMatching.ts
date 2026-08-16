import { QUESTION_CATEGORIES, QuestionCategory } from '../constants/questionCategories';

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'being', 'could', 'every', 'first', 'great',
  'other', 'should', 'their', 'there', 'these', 'think', 'those', 'through',
  'under', 'where', 'which', 'while', 'would', 'what', 'when', 'with', 'have',
  'from', 'this', 'that', 'your', 'need', 'help', 'want', 'know', 'someone',
  'anyone', 'please', 'question', 'looking', 'advice',
]);

const CATEGORY_KEYWORDS: Record<QuestionCategory, string[]> = {
  business: ['business', 'company', 'enterprise', 'b2b', 'sales', 'marketing', 'management'],
  career: ['career', 'job', 'interview', 'resume', 'promotion', 'workplace', 'salary', 'hr'],
  sports: ['sport', 'fitness', 'cricket', 'football', 'gym', 'training', 'athlete'],
  education: ['education', 'school', 'teacher', 'learning', 'course', 'exam', 'study'],
  money: ['money', 'budget', 'saving', 'debt', 'loan', 'income', 'expense'],
  life: ['life', 'relationship', 'family', 'mental', 'health', 'habit', 'daily'],
  startups: ['startup', 'founder', 'mvp', 'pitch', 'vc', 'bootstrap', 'launch'],
  skills: ['skill', 'learn', 'practice', 'certification', 'portfolio'],
  freelancing: ['freelance', 'client', 'contract', 'upwork', 'fiverr', 'gig'],
  design: ['design', 'ui', 'ux', 'figma', 'brand', 'creative', 'graphic'],
  finance: ['finance', 'invest', 'stock', 'tax', 'portfolio', 'mutual', 'crypto'],
  'personal-growth': ['growth', 'mindset', 'motivation', 'productivity', 'self'],
  gaming: ['game', 'gaming', 'esports', 'stream', 'console', 'pc'],
  college: ['college', 'university', 'campus', 'admission', 'degree', 'semester'],
  programming: ['code', 'programming', 'developer', 'software', 'bug', 'api', 'react', 'node'],
  other: [],
};

export interface MatchableUser {
  _id: { toString(): string };
  name: string;
  username: string;
  avatar?: string;
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
  badges: string[];
  verifiedExperience: boolean;
  identityVerified: boolean;
  communityTrusted: boolean;
}

export interface PeopleMatchResult {
  user: MatchableUser;
  score: number;
  matchReason: string;
  overlapTopics: string[];
}

export interface QuestionAnalysis {
  suggestedCategory: QuestionCategory;
  categoryScores: Record<string, number>;
  suggestedTags: string[];
}

export const extractKeywords = (text: string): string[] => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  return [...new Set(words)];
};

export const analyzeQuestion = (text: string): QuestionAnalysis => {
  const keywords = extractKeywords(text);
  const lower = text.toLowerCase();

  const categoryScores: Record<string, number> = {};
  for (const category of QUESTION_CATEGORIES) {
    let score = 0;
    for (const kw of CATEGORY_KEYWORDS[category]) {
      if (lower.includes(kw)) score += 2;
      if (keywords.includes(kw)) score += 3;
    }
    categoryScores[category] = score;
  }

  const sorted = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);
  const suggestedCategory =
    sorted[0][1] > 0 ? (sorted[0][0] as QuestionCategory) : 'other';

  const suggestedTags = keywords
    .filter((w) => w.length > 3)
    .slice(0, 8);

  for (const [cat, score] of sorted.slice(0, 2)) {
    if (score > 0 && cat !== 'other') suggestedTags.unshift(cat);
  }

  return {
    suggestedCategory,
    categoryScores,
    suggestedTags: [...new Set(suggestedTags)].slice(0, 10),
  };
};

const normalizeTag = (value: string): string =>
  value.toLowerCase().trim().replace(/\s+/g, '-');

const overlapScore = (needles: string[], haystack: string[]): string[] => {
  const normalizedHay = haystack.map(normalizeTag);
  return needles.filter((n) =>
    normalizedHay.some(
      (h) => h.includes(normalizeTag(n)) || normalizeTag(n).includes(h)
    )
  );
};

const buildMatchReason = (
  user: MatchableUser,
  overlaps: string[],
  location?: string
): string => {
  const parts: string[] = [];

  if (overlaps.length) {
    const label = overlaps.slice(0, 2).join(', ');
    parts.push(`Experience in ${label}`);
  } else if (user.profession) {
    parts.push(user.profession);
  } else if (user.headline) {
    parts.push(user.headline);
  }

  const userLocation = user.location?.trim();
  const questionLocation = location?.trim();
  if (
    userLocation &&
    questionLocation &&
    userLocation.toLowerCase().includes(questionLocation.toLowerCase())
  ) {
    parts.push(userLocation);
  } else if (userLocation && overlaps.length === 0) {
    parts.push(userLocation);
  }

  if (user.verifiedExperience) {
    parts.push('Verified experience');
  }

  if (!parts.length) {
    return 'Relevant community member';
  }

  return parts.join(' · ');
};

export const scoreUserForQuestion = (
  user: MatchableUser,
  questionText: string,
  options: {
    category?: string;
    tags?: string[];
    location?: string;
  } = {}
): PeopleMatchResult => {
  const keywords = extractKeywords(questionText);
  const tagPool = [
    ...keywords,
    ...(options.tags || []).map(normalizeTag),
    ...(options.category ? [options.category] : []),
  ];

  const userTags = [
    ...user.experienceTags,
    ...user.skills,
    ...user.interests,
    user.profession || '',
    user.headline || '',
    user.bio || '',
  ].filter(Boolean);

  const overlaps = overlapScore(tagPool, userTags);
  let score = overlaps.length * 12;

  if (options.category) {
    const catKeywords = CATEGORY_KEYWORDS[options.category as QuestionCategory] || [];
    for (const kw of catKeywords) {
      if (userTags.some((t) => normalizeTag(t).includes(kw))) score += 4;
    }
  }

  if (options.location && user.location) {
    const loc = options.location.toLowerCase();
    if (user.location.toLowerCase().includes(loc)) score += 15;
  }

  score += Math.min(user.peopleHelped * 0.5, 25);
  score += Math.min(user.questionsAnswered * 0.3, 15);
  score += (user.communityRating - 3) * 3;
  if (user.verifiedExperience) score += 8;
  if (user.communityTrusted) score += 5;
  if (user.identityVerified) score += 3;

  return {
    user,
    score: Math.round(score * 10) / 10,
    matchReason: buildMatchReason(user, overlaps, options.location),
    overlapTopics: overlaps.slice(0, 5),
  };
};

export const matchPeopleToQuestion = (
  users: MatchableUser[],
  questionText: string,
  options: {
    category?: string;
    tags?: string[];
    location?: string;
    limit?: number;
  } = {}
): { topics: string[]; people: PeopleMatchResult[] } => {
  const analysis = analyzeQuestion(questionText);
  const topics = [
    ...new Set([
      ...(options.tags || []).map(normalizeTag),
      ...(options.category ? [options.category] : []),
      ...analysis.suggestedTags,
    ]),
  ].slice(0, 8);

  const scored = users
    .map((user) =>
      scoreUserForQuestion(user, questionText, {
        category: options.category || analysis.suggestedCategory,
        tags: options.tags || analysis.suggestedTags,
        location: options.location,
      })
    )
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return {
    topics,
    people: scored.slice(0, options.limit || 10),
  };
};

export const calculateQuestionTrendingScore = (
  helpfulCount: number,
  answersCount: number,
  savesCount: number,
  viewsCount: number,
  createdAt: Date
): number => {
  const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const engagement = helpfulCount * 3 + answersCount * 5 + savesCount * 4 + viewsCount * 0.1;
  const timeDecay = Math.pow(hoursSinceCreation + 2, 1.5);
  return engagement / timeDecay;
};
