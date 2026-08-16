export interface DefaultCommunitySeed {
  name: string;
  slug: string;
  description: string;
  tags: string[];
  categories: string[];
}

/** Suggested communities for the human-experience MVP — seeded on startup when DB is empty. */
export const DEFAULT_COMMUNITIES: DefaultCommunitySeed[] = [
  {
    name: 'Career & Jobs',
    slug: 'career-jobs',
    description: 'Ask about interviews, career switches, resumes, and workplace challenges.',
    tags: ['career', 'jobs', 'interviews'],
    categories: ['career'],
  },
  {
    name: 'Startups & Founders',
    slug: 'startups-founders',
    description: 'Build, launch, and scale — learn from people who have been there.',
    tags: ['startups', 'founders', 'entrepreneurship'],
    categories: ['startups', 'business'],
  },
  {
    name: 'Programming & Tech',
    slug: 'programming-tech',
    description: 'Code, architecture, debugging, and tech career questions.',
    tags: ['programming', 'software', 'tech'],
    categories: ['programming'],
  },
  {
    name: 'Money & Finance',
    slug: 'money-finance',
    description: 'Personal finance, investing, taxes, and money decisions.',
    tags: ['finance', 'investing', 'money'],
    categories: ['finance', 'money'],
  },
  {
    name: 'College & Education',
    slug: 'college-education',
    description: 'Admissions, courses, study tips, and academic life.',
    tags: ['college', 'education', 'study'],
    categories: ['education', 'college'],
  },
  {
    name: 'Freelancing & Skills',
    slug: 'freelancing-skills',
    description: 'Clients, pricing, portfolios, and skill-building.',
    tags: ['freelancing', 'skills', 'side-hustle'],
    categories: ['freelancing', 'skills'],
  },
  {
    name: 'Life & Personal Growth',
    slug: 'life-personal-growth',
    description: 'Relationships, habits, mental health, and everyday life.',
    tags: ['life', 'personal-growth', 'wellness'],
    categories: ['life', 'personal-growth'],
  },
  {
    name: 'Design & Creative',
    slug: 'design-creative',
    description: 'UI/UX, branding, portfolios, and creative careers.',
    tags: ['design', 'ux', 'creative'],
    categories: ['design'],
  },
];
