export interface User {
  _id: string;
  name: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  headline?: string;
  location?: string;
  profession?: string;
  skills?: string[];
  interests?: string[];
  experienceTags?: string[];
  peopleHelped?: number;
  questionsAnswered?: number;
  communityRating?: number;
  topicsCount?: number;
  verifiedExperience?: boolean;
  identityVerified?: boolean;
  communityTrusted?: boolean;
  badges?: string[];
  role?: "user" | "moderator" | "admin";
  followers?: string[];
  following?: string[];
}

export interface Question {
  _id: string;
  content: string;
  category: string;
  tags: string[];
  isAnonymous: boolean;
  answersCount: number;
  helpfulCount: number;
  savesCount?: number;
  viewsCount?: number;
  status?: string;
  location?: string;
  author?: User | null;
  createdAt?: string;
}

export interface Answer {
  _id: string;
  content: string;
  helpfulCount: number;
  isBestAnswer?: boolean;
  author?: User;
  question?: string;
  createdAt?: string;
}

export interface Community {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  memberCount?: number;
  postCount?: number;
  tags?: string[];
  logo?: string;
  banner?: string;
}

export interface MatchedPerson extends User {
  matchReason?: string;
  matchScore?: number;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  link?: string;
  createdAt: string;
  actor?: User;
}

export interface SearchResults {
  users: User[];
  communities: Community[];
  questions: Question[];
  posts?: unknown[];
  events?: unknown[];
  query?: string;
}

export interface LeaderboardEntry {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  xp?: number;
  level?: number;
  badges?: string[];
  peopleHelped?: number;
  questionsAnswered?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Legacy types for non-MVP routes still in codebase
export interface Post {
  _id: string;
  id?: string;
  title?: string;
  content: string;
  author?: User;
  community?: Community;
  hashtags?: string[];
  tags?: string[];
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt?: string;
}

export interface Comment {
  _id: string;
  content: string;
  author?: User;
  replies?: Comment[];
  likesCount?: number;
  createdAt?: string;
}

export interface Event {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  startDate: string;
  host?: User;
  image?: string;
  location?: string;
  isOnline?: boolean;
  isAttending?: boolean;
  attendeesCount?: number;
}

export interface Message {
  _id: string;
  id?: string;
  content: string;
  sender?: User;
  createdAt?: string;
}

export interface Conversation {
  _id: string;
  id?: string;
  participants?: User[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface MarketplaceListing {
  _id: string;
  title: string;
  price?: number;
  currency?: string;
  description?: string;
  images?: string[];
  seller?: User;
  status?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name?: string;
  displayName?: string;
  username: string;
  email: string;
  password: string;
}

export interface CreatePostData {
  content: string;
  title?: string;
  communityId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface DashboardStats {
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  xp?: number;
}
