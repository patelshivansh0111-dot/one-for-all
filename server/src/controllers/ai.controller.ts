import { Request, Response } from 'express';
import Post from '../models/Post';
import User from '../models/User';
import Community from '../models/Community';
import AIRecommendation from '../models/AIRecommendation';
import { AuthRequest } from '../types/express';
import { sendSuccess } from '../utils/helpers';
import { notFound, badRequest } from '../utils/apiError';
import {
  moderateContent,
  summarizeText,
  suggestHashtags,
  generateCommunityRules,
  generateEventDescription,
} from '../utils/moderation';
import { analyzeQuestion, matchPeopleToQuestion } from '../utils/aiMatching';

export const summarizePost = async (req: Request, res: Response): Promise<void> => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw notFound('Post not found');

  const text = post.markdown || post.content;
  const summary = summarizeText(text, req.body.maxSentences || 3);

  sendSuccess(res, {
    summary,
    originalLength: text.length,
    summaryLength: summary.length,
    compressionRatio: Math.round((1 - summary.length / text.length) * 100),
  });
};

export const recommendCommunities = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const user = await User.findById(authReq.user!._id);
  if (!user) throw notFound('User not found');

  const joinedIds = user.communities.map((id) => id.toString());

  const scoreFilter = [
    ...user.interests.map((i) => ({ tags: { $regex: i, $options: 'i' } })),
    ...user.skills.map((s) => ({ tags: { $regex: s, $options: 'i' } })),
    ...user.interests.map((i) => ({ categories: { $regex: i, $options: 'i' } })),
  ];

  const communities = await Community.find({
    _id: { $nin: joinedIds },
    isPrivate: false,
    ...(scoreFilter.length ? { $or: scoreFilter } : {}),
  })
    .sort({ memberCount: -1 })
    .limit(10)
    .select('name slug description logo tags memberCount');

  const scored = communities.map((c) => {
    let score = c.memberCount * 0.1;
    for (const interest of user.interests) {
      if (c.tags.some((t) => t.toLowerCase().includes(interest.toLowerCase()))) score += 10;
      if (c.categories.some((cat) => cat.toLowerCase().includes(interest.toLowerCase()))) score += 8;
    }
    for (const skill of user.skills) {
      if (c.tags.some((t) => t.toLowerCase().includes(skill.toLowerCase()))) score += 12;
    }
    return { community: c, score: Math.round(score) };
  });

  scored.sort((a, b) => b.score - a.score);
  sendSuccess(res, { recommendations: scored.slice(0, 5) });
};

export const recommendFriends = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const user = await User.findById(authReq.user!._id);
  if (!user) throw notFound('User not found');

  const excludeIds = [
    user._id.toString(),
    ...user.following.map((id) => id.toString()),
    ...user.blockedUsers.map((id) => id.toString()),
  ];

  const candidates = await User.find({
    _id: { $nin: excludeIds },
    isBanned: false,
    $or: [
      { skills: { $in: user.skills } },
      { interests: { $in: user.interests } },
      { followers: { $in: user.following } },
    ],
  })
    .select('name username avatar bio skills interests followers')
    .limit(30);

  const scored = candidates.map((c) => {
    let score = 0;
    const sharedSkills = c.skills.filter((s) => user.skills.includes(s));
    const sharedInterests = c.interests.filter((i) => user.interests.includes(i));
    const mutualFollowers = c.followers.filter((f) =>
      user.following.some((uf) => uf.toString() === f.toString())
    );

    score += sharedSkills.length * 15;
    score += sharedInterests.length * 10;
    score += mutualFollowers.length * 20;
    score += Math.min(c.followers.length * 0.05, 5);

    return {
      user: {
        _id: c._id,
        name: c.name,
        username: c.username,
        avatar: c.avatar,
        bio: c.bio,
        skills: c.skills,
      },
      score: Math.round(score),
      sharedSkills,
      sharedInterests,
      mutualConnections: mutualFollowers.length,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  sendSuccess(res, { recommendations: scored.slice(0, 10) });
};

export const generateRules = async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;
  if (!name) throw badRequest('Community name required');

  const rules = generateCommunityRules(name, description || '');
  sendSuccess(res, { rules });
};

export const generateEventDesc = async (req: Request, res: Response): Promise<void> => {
  const { title, type, location } = req.body;
  if (!title || !type) throw badRequest('Title and type required');

  const description = generateEventDescription(title, type, location);
  sendSuccess(res, { description });
};

export const suggestTags = async (req: Request, res: Response): Promise<void> => {
  const { content, existing } = req.body;
  if (!content) throw badRequest('Content required');

  const hashtags = suggestHashtags(content, existing || []);
  sendSuccess(res, { hashtags });
};

export const moderateText = async (req: Request, res: Response): Promise<void> => {
  const { text } = req.body;
  if (!text) throw badRequest('Text required');

  const result = moderateContent(text);
  sendSuccess(res, { moderation: result });
};

export const summarizeContent = async (req: Request, res: Response): Promise<void> => {
  const { text, maxSentences } = req.body;
  if (!text) throw badRequest('Text required');

  const summary = summarizeText(text, maxSentences || 3);
  sendSuccess(res, { summary });
};

export const matchPeople = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { question, category, tags, location } = req.body;

  if (!question?.trim()) throw badRequest('Question text is required');

  const excludeIds = [authReq.user!._id.toString()];
  const currentUser = await User.findById(authReq.user!._id);
  if (currentUser) {
    excludeIds.push(...currentUser.blockedUsers.map((id) => id.toString()));
  }

  const candidates = await User.find({
    _id: { $nin: excludeIds },
    isBanned: false,
  })
    .select(
      'name username avatar bio location profession headline skills interests experienceTags peopleHelped questionsAnswered communityRating badges verifiedExperience identityVerified communityTrusted'
    )
    .limit(200);

  const { topics, people } = matchPeopleToQuestion(candidates, question, {
    category,
    tags,
    location,
    limit: 10,
  });

  const responsePeople = people.map(({ user, score, matchReason, overlapTopics }) => ({
    _id: user._id,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    profession: user.profession,
    headline: user.headline,
    skills: user.skills,
    peopleHelped: user.peopleHelped,
    questionsAnswered: user.questionsAnswered,
    communityRating: user.communityRating,
    badges: user.badges,
    verifiedExperience: user.verifiedExperience,
    identityVerified: user.identityVerified,
    communityTrusted: user.communityTrusted,
    matchScore: score,
    matchReason,
    overlapTopics,
  }));

  await AIRecommendation.create({
    user: authReq.user!._id,
    recommendedUsers: people.map((p) => p.user._id as import('mongoose').Types.ObjectId),
    scores: people.map((p) => p.score),
    reason: people.map((p) => p.matchReason).join('; '),
  });

  sendSuccess(res, { topics, people: responsePeople });
};

export const analyzeQuestionText = async (req: Request, res: Response): Promise<void> => {
  const { question } = req.body;
  if (!question?.trim()) throw badRequest('Question text is required');

  const analysis = analyzeQuestion(question);
  sendSuccess(res, {
    category: analysis.suggestedCategory,
    categoryScores: analysis.categoryScores,
    tags: analysis.suggestedTags,
  });
};
