import {
  Bell,
  Bookmark,
  Compass,
  Home,
  MessageCircleQuestion,
  Users,
  UserRound,
} from "lucide-react";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const APP_NAME = "One for All";
export const APP_TAGLINE = "Ask people who've been there.";
export const APP_SUBTITLE = "A COMMUNITY FOR HUMAN EXPERIENCE";
export const BRAND_LINE = "Everyone knows something. Someone needs to know it.";
export const PHILOSOPHY = "Ask. Learn. Grow. Give back.";
export const VISION = "The search engine for human experience.";

export const CATEGORIES = [
  "BUSINESS",
  "CAREER",
  "SPORTS",
  "LIFE",
  "EDUCATION",
  "STARTUPS",
  "MONEY",
  "SKILLS",
  "FREELANCING",
  "DESIGN",
  "FINANCE",
  "PERSONAL GROWTH",
  "GAMING",
  "COLLEGE",
  "PROGRAMMING",
] as const;

export const EXAMPLE_QUESTIONS = [
  "How do I start my first business?",
  "How do I get into professional football?",
  "Should I choose CSE or pursue design?",
  "How do I get my first freelance client?",
  "How do I start investing?",
  "How do I build a startup with no team?",
];

export const STICKER_COLORS = [
  "sticker-yellow",
  "sticker-blue",
  "sticker-pink",
  "sticker-mint",
  "sticker-white",
] as const;

export interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  adminOnly?: boolean;
}

export const APP_NAV: NavItem[] = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Ask", href: "/ask", icon: MessageCircleQuestion },
  { label: "Communities", href: "/communities", icon: Users },
  { label: "People", href: "/people", icon: UserRound },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export const SIDEBAR_NAV = APP_NAV;

export const MOBILE_NAV: NavItem[] = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Ask", href: "/ask", icon: MessageCircleQuestion },
  { label: "Communities", href: "/communities", icon: Users },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export const LANDING_NAV = [
  { label: "INDEX", href: "#index" },
  { label: "HOW IT WORKS", href: "#how-it-works" },
  { label: "COMMUNITIES", href: "#communities" },
  { label: "PEOPLE", href: "#people" },
  { label: "ABOUT", href: "#about" },
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "ASK",
    body: "Tell the community what you're trying to figure out.",
  },
  {
    step: "02",
    title: "MATCH",
    body: "AI finds people who may have relevant experience.",
  },
  {
    step: "03",
    title: "LEARN",
    body: "Get advice, perspectives, and real-world experience.",
  },
  {
    step: "04",
    title: "GIVE BACK",
    body: "Eventually, help someone else with what you've learned.",
  },
];

export const FEATURES = HOW_IT_WORKS.map((item, i) => ({
  title: item.title,
  description: item.body,
  icon: ["users", "zap", "rocket", "trophy"][i] || "sparkles",
}));

export const DEMO_COMMUNITIES = [
  {
    _id: "c1",
    name: "First-Time Founders",
    slug: "first-time-founders",
    description: "People figuring out how to start something from scratch.",
    memberCount: 1240,
    tags: ["STARTUPS", "BUSINESS"],
  },
  {
    _id: "c2",
    name: "Freelancers India",
    slug: "freelancers-india",
    description: "Getting clients, pricing, and building a solo practice.",
    memberCount: 890,
    tags: ["FREELANCING", "CAREER"],
  },
  {
    _id: "c3",
    name: "College & Career",
    slug: "college-career",
    description: "Choosing paths, internships, and early career decisions.",
    memberCount: 2100,
    tags: ["COLLEGE", "CAREER"],
  },
  {
    _id: "c4",
    name: "Apparel & Manufacturing",
    slug: "apparel-manufacturing",
    description: "Clothing businesses, suppliers, and Gujarat manufacturing.",
    memberCount: 456,
    tags: ["BUSINESS", "MANUFACTURING"],
  },
];

export const DEMO_PEOPLE = [
  {
    _id: "p1",
    name: "Rahul Shah",
    username: "rahulshah",
    headline: "Clothing Business Owner",
    location: "Ahmedabad, Gujarat",
    peopleHelped: 42,
    experienceTags: ["ENTREPRENEURSHIP", "APPAREL", "MANUFACTURING"],
  },
  {
    _id: "p2",
    name: "Priya Mehta",
    username: "priyamehta",
    headline: "Apparel Manufacturer",
    location: "Gujarat",
    peopleHelped: 68,
    experienceTags: ["MANUFACTURING", "SUPPLY CHAIN", "BUSINESS"],
  },
  {
    _id: "p3",
    name: "Aman Desai",
    username: "amandesai",
    headline: "D2C Founder",
    location: "Surat",
    peopleHelped: 31,
    experienceTags: ["STARTUPS", "E-COMMERCE", "BRANDING"],
  },
  {
    _id: "p4",
    name: "Neha Kapoor",
    username: "nehakapoor",
    headline: "Freelance Designer",
    location: "Mumbai",
    peopleHelped: 55,
    experienceTags: ["DESIGN", "FREELANCING", "CLIENTS"],
  },
  {
    _id: "p5",
    name: "Vikram Singh",
    username: "vikramsingh",
    headline: "Career Coach",
    location: "Delhi",
    peopleHelped: 89,
    experienceTags: ["CAREER", "INTERVIEWS", "COLLEGE"],
  },
  {
    _id: "p6",
    name: "Sneha Reddy",
    username: "snehareddy",
    headline: "Startup Operator",
    location: "Bangalore",
    peopleHelped: 37,
    experienceTags: ["STARTUPS", "OPERATIONS", "FUNDRAISING"],
  },
];

export const POPULAR_TOPICS = [
  "STARTUPS",
  "FREELANCING",
  "CAREER",
  "BUSINESS",
  "MONEY",
  "COLLEGE",
  "DESIGN",
  "SPORTS",
];

export const DEMO_MATCHES = [
  {
    name: "Rahul Shah",
    role: "Clothing Business Owner",
    years: "8 years experience",
    location: "Ahmedabad",
    helped: 42,
    tags: ["ENTREPRENEURSHIP", "APPAREL", "MANUFACTURING"],
    reason: "Experience in apparel manufacturing · Gujarat",
  },
  {
    name: "Priya Mehta",
    role: "Apparel Manufacturer",
    years: "6 years experience",
    location: "Gujarat",
    helped: 68,
    tags: ["MANUFACTURING", "SUPPLY CHAIN", "BUSINESS"],
    reason: "Runs manufacturing operations · Helped 68 people",
  },
  {
    name: "Aman Desai",
    role: "D2C Founder",
    years: "5 years experience",
    location: "Surat",
    helped: 31,
    tags: ["STARTUPS", "E-COMMERCE", "BRANDING"],
    reason: "Built a clothing brand from scratch · Surat",
  },
];
