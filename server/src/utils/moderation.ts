const PROFANITY_LIST = [
  'damn', 'hell', 'crap', 'ass', 'bastard', 'bitch', 'shit', 'fuck',
  'fucking', 'fucker', 'dick', 'piss', 'slut', 'whore',
];

const SPAM_PATTERNS = [
  /(.)\1{5,}/,
  /(https?:\/\/[^\s]+\s*){4,}/i,
  /\b(buy now|click here|free money|earn \$|crypto giveaway)\b/i,
  /[A-Z\s]{20,}/,
];

const HATE_PATTERNS = [
  /\b(kill\s+(all|every)\s+\w+)\b/i,
  /\b(hate\s+(all|every)\s+\w+)\b/i,
];

export interface ModerationResult {
  flagged: boolean;
  score: number;
  reasons: string[];
  action: 'allow' | 'review' | 'block';
}

export const moderateContent = (text: string): ModerationResult => {
  const reasons: string[] = [];
  let score = 0;
  const lower = text.toLowerCase();

  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lower)) {
      reasons.push(`Profanity detected: "${word}"`);
      score += 15;
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      reasons.push('Spam pattern detected');
      score += 25;
      break;
    }
  }

  for (const pattern of HATE_PATTERNS) {
    if (pattern.test(text)) {
      reasons.push('Potentially harmful content detected');
      score += 40;
      break;
    }
  }

  const capsRatio = (text.match(/[A-Z]/g)?.length || 0) / Math.max(text.length, 1);
  if (text.length > 20 && capsRatio > 0.7) {
    reasons.push('Excessive capitalization');
    score += 10;
  }

  if (text.split(/\s+/).filter((w) => w.length > 15).length > 3) {
    reasons.push('Suspicious word patterns');
    score += 10;
  }

  let action: ModerationResult['action'] = 'allow';
  if (score >= 50) action = 'block';
  else if (score >= 20) action = 'review';

  return { flagged: score > 0, score, reasons, action };
};

export const summarizeText = (text: string, maxSentences = 3): string => {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 10);

  if (sentences.length <= maxSentences) return text.trim();

  const scored = sentences.map((sentence, index) => {
    const words = sentence.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const positionBoost = index === 0 ? 2 : index === sentences.length - 1 ? 1 : 0;
    return { sentence, score: uniqueWords.size + positionBoost };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence))
    .map((s) => s.sentence)
    .join(' ');
};

export const suggestHashtags = (text: string, existing: string[] = []): string[] => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 4);

  const stopWords = new Set([
    'about', 'after', 'again', 'being', 'could', 'every', 'first',
    'great', 'other', 'should', 'their', 'there', 'these', 'think',
    'those', 'through', 'under', 'where', 'which', 'while', 'would',
  ]);

  const freq = new Map<string, number>();
  for (const word of words) {
    if (stopWords.has(word)) continue;
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  const suggested = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  return [...new Set([...existing, ...suggested])].slice(0, 10);
};

export const generateCommunityRules = (name: string, description: string): string[] => {
  const base = [
    `Be respectful to all members of ${name}.`,
    'No harassment, hate speech, or personal attacks.',
    'Keep discussions on-topic and constructive.',
    'No spam, self-promotion without permission, or misleading content.',
    'Respect privacy — do not share others\' personal information.',
    'Follow platform guidelines and report violations.',
  ];

  const desc = description.toLowerCase();
  if (desc.includes('tech') || desc.includes('code') || desc.includes('developer')) {
    base.push('Share code with proper formatting and attribution.');
    base.push('No pirated software or unauthorized sharing of proprietary code.');
  }
  if (desc.includes('gaming')) {
    base.push('No cheating, exploits, or toxic behavior in-game discussions.');
  }
  if (desc.includes('study') || desc.includes('learning')) {
    base.push('Help others learn — no shaming for questions.');
    base.push('Cite sources when sharing academic content.');
  }

  return base;
};

export const generateEventDescription = (
  title: string,
  type: string,
  location?: string
): string => {
  const typeDescriptions: Record<string, string> = {
    meetup: `Join us for ${title}! Connect with like-minded community members in person${location ? ` at ${location}` : ''}. Network, share ideas, and build lasting connections.`,
    hackathon: `${title} — a collaborative coding event where teams build innovative projects. Whether you're a beginner or expert, come create something amazing together!`,
    gaming: `Game on at ${title}! Whether you're casual or competitive, join fellow gamers for an epic session. Bring your setup and good vibes.`,
    study: `${title} — a focused study session for learners at all levels. Bring your materials, ask questions, and learn together in a supportive environment.`,
    sports: `Get active at ${title}! All skill levels welcome. Come play, compete, and have fun with the community.`,
    workshop: `${title} — a hands-on workshop where you'll learn practical skills. Come prepared to participate and apply what you learn.`,
    online: `Join ${title} from anywhere! This virtual event brings our community together online. Grab your favorite beverage and tune in.`,
  };

  return typeDescriptions[type] || `Join us for ${title}! An exciting ${type} event for our community.`;
};
