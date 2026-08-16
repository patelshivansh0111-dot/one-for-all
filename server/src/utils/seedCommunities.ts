import Community from '../models/Community';
import User from '../models/User';
import { DEFAULT_COMMUNITIES } from '../constants/defaultCommunities';

export const seedDefaultCommunities = async (): Promise<void> => {
  const count = await Community.countDocuments();
  if (count > 0) return;

  const creator =
    (await User.findOne({ role: 'admin' })) ||
    (await User.findOne().sort({ createdAt: 1 }));

  if (!creator) {
    console.log('ℹ️  Skipping community seed — no users in database yet');
    return;
  }

  for (const seed of DEFAULT_COMMUNITIES) {
    const existing = await Community.findOne({ slug: seed.slug });
    if (existing) continue;

    await Community.create({
      name: seed.name,
      slug: seed.slug,
      description: seed.description,
      tags: seed.tags,
      categories: seed.categories,
      creator: creator._id,
      admins: [creator._id],
      members: [{ user: creator._id, role: 'admin', joinedAt: new Date() }],
      isPrivate: false,
      memberCount: 1,
      postCount: 0,
      rules: [
        'Ask genuine questions — share enough context for people to help.',
        'Be respectful; experiences differ.',
        'Give back when you can — knowledge shared grows the community.',
        'No spam, harassment, or misleading advice.',
      ],
    });
  }

  console.log(`✅ Seeded ${DEFAULT_COMMUNITIES.length} default communities`);
};
