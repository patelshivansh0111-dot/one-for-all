import { Request, Response } from 'express';
import Community from '../models/Community';
import User from '../models/User';
import Post from '../models/Post';
import { AuthRequest } from '../types/express';
import { sendSuccess, paginateQuery, slugify, generateToken } from '../utils/helpers';
import { notFound, badRequest, forbidden } from '../utils/apiError';

const isMember = (community: InstanceType<typeof Community>, userId: string): boolean =>
  community.members.some((m) => m.user.toString() === userId);

const isAdminOrMod = (community: InstanceType<typeof Community>, userId: string): boolean =>
  community.creator.toString() === userId ||
  community.admins.some((id) => id.toString() === userId) ||
  community.moderators.some((id) => id.toString() === userId);

export const createCommunity = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  let slug = slugify(req.body.name);
  const existing = await Community.findOne({ slug });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const community = await Community.create({
    ...req.body,
    slug,
    creator: authReq.user!._id,
    admins: [authReq.user!._id],
    members: [{ user: authReq.user!._id, role: 'admin', joinedAt: new Date() }],
    inviteCode: req.body.isPrivate ? generateToken(8) : undefined,
  });

  await User.findByIdAndUpdate(authReq.user!._id, {
    $addToSet: { communities: community._id },
  });

  sendSuccess(res, { community }, 'Community created', 201);
};

export const listCommunities = async (req: Request, res: Response): Promise<void> => {
  const { skip, limit, page } = paginateQuery(req.query.page as string, req.query.limit as string);
  const filter: Record<string, unknown> = {};

  if (req.query.tag) filter.tags = req.query.tag;
  if (req.query.category) filter.categories = req.query.category;
  if (req.query.search) filter.$text = { $search: req.query.search as string };

  const [communities, total] = await Promise.all([
    Community.find(filter)
      .sort({ memberCount: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creator', 'name username avatar'),
    Community.countDocuments(filter),
  ]);

  sendSuccess(res, { communities, pagination: { page, limit, total } });
};

export const getCommunityBySlug = async (req: Request, res: Response): Promise<void> => {
  const community = await Community.findOne({ slug: req.params.slug })
    .populate('creator', 'name username avatar')
    .populate('admins moderators', 'name username avatar');

  if (!community) throw notFound('Community not found');

  const authReq = req as AuthRequest;
  if (community.isPrivate && authReq.user) {
    if (!isMember(community, authReq.user._id.toString())) {
      throw forbidden('This is a private community');
    }
  }

  sendSuccess(res, { community });
};

export const joinCommunity = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const community = await Community.findOne({ slug: req.params.slug });
  if (!community) throw notFound('Community not found');

  if (isMember(community, authReq.user!._id.toString())) {
    throw badRequest('Already a member');
  }

  if (community.isPrivate) {
    const { inviteCode } = req.body;
    if (inviteCode !== community.inviteCode) throw forbidden('Invalid invite code');
  }

  community.members.push({ user: authReq.user!._id, role: 'member', joinedAt: new Date() });
  community.memberCount += 1;
  await community.save();

  await User.findByIdAndUpdate(authReq.user!._id, {
    $addToSet: { communities: community._id },
  });

  sendSuccess(res, undefined, 'Joined community');
};

export const leaveCommunity = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const community = await Community.findOne({ slug: req.params.slug });
  if (!community) throw notFound('Community not found');

  if (community.creator.toString() === authReq.user!._id.toString()) {
    throw badRequest('Creator cannot leave. Transfer ownership or delete community.');
  }

  community.members = community.members.filter(
    (m) => m.user.toString() !== authReq.user!._id.toString()
  );
  community.memberCount = Math.max(0, community.memberCount - 1);
  await community.save();

  await User.findByIdAndUpdate(authReq.user!._id, {
    $pull: { communities: community._id },
  });

  sendSuccess(res, undefined, 'Left community');
};

export const updateCommunity = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const community = await Community.findOne({ slug: req.params.slug });
  if (!community) throw notFound('Community not found');
  if (!isAdminOrMod(community, authReq.user!._id.toString())) throw forbidden('Not authorized');

  const allowed = ['name', 'description', 'banner', 'logo', 'rules', 'tags', 'categories', 'isPrivate'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) (community as unknown as Record<string, unknown>)[key] = req.body[key];
  }

  await community.save();
  sendSuccess(res, { community }, 'Community updated');
};

export const getMembers = async (req: Request, res: Response): Promise<void> => {
  const { skip, limit } = paginateQuery(req.query.page as string, req.query.limit as string);
  const community = await Community.findOne({ slug: req.params.slug });
  if (!community) throw notFound('Community not found');

  const memberSlice = community.members.slice(skip, skip + limit);
  const userIds = memberSlice.map((m) => m.user);
  const users = await User.find({ _id: { $in: userIds } }).select('name username avatar');

  const members = memberSlice.map((m) => ({
    user: m.user,
    role: m.role,
    joinedAt: m.joinedAt,
    profile: users.find((u) => u._id.toString() === m.user.toString()),
  }));

  sendSuccess(res, { members, total: community.memberCount });
};

export const updateMemberRole = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { userId, role } = req.body;
  const community = await Community.findOne({ slug: req.params.slug });
  if (!community) throw notFound('Community not found');
  if (community.creator.toString() !== authReq.user!._id.toString()) throw forbidden('Only creator can change roles');

  const member = community.members.find((m) => m.user.toString() === userId);
  if (!member) throw notFound('Member not found');

  member.role = role;
  if (role === 'admin') community.admins.push(member.user);
  if (role === 'moderator') community.moderators.push(member.user);

  await community.save();
  sendSuccess(res, undefined, 'Role updated');
};

export const pinPost = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const community = await Community.findOne({ slug: req.params.slug });
  if (!community) throw notFound('Community not found');
  if (!isAdminOrMod(community, authReq.user!._id.toString())) throw forbidden('Not authorized');

  const postId = req.params.postId;
  const post = await Post.findById(postId);
  if (!post) throw notFound('Post not found');

  if (!community.pinnedPosts.some((id) => id.toString() === postId)) {
    community.pinnedPosts.push(post._id);
    post.isPinned = true;
    await post.save();
  }

  await community.save();
  sendSuccess(res, undefined, 'Post pinned');
};

export const createAnnouncement = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const community = await Community.findOne({ slug: req.params.slug });
  if (!community) throw notFound('Community not found');
  if (!isAdminOrMod(community, authReq.user!._id.toString())) throw forbidden('Not authorized');

  community.announcements.unshift({
    title: req.body.title,
    content: req.body.content,
    createdAt: new Date(),
    author: authReq.user!._id,
  });

  await community.save();
  sendSuccess(res, { announcements: community.announcements }, 'Announcement created', 201);
};

export const regenerateInvite = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const community = await Community.findOne({ slug: req.params.slug });
  if (!community) throw notFound('Community not found');
  if (!isAdminOrMod(community, authReq.user!._id.toString())) throw forbidden('Not authorized');

  community.inviteCode = generateToken(8);
  await community.save();
  sendSuccess(res, { inviteCode: community.inviteCode });
};

export const getCommunityPosts = async (req: Request, res: Response): Promise<void> => {
  const { skip, limit } = paginateQuery(req.query.page as string, req.query.limit as string);
  const community = await Community.findOne({ slug: req.params.slug });
  if (!community) throw notFound('Community not found');

  const posts = await Post.find({ community: community._id })
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name username avatar');

  sendSuccess(res, { posts });
};
