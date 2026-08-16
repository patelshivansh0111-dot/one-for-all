import { Request, Response } from 'express';
import MarketplaceListing from '../models/MarketplaceListing';
import { AuthRequest } from '../types/express';
import { sendSuccess, paginateQuery } from '../utils/helpers';
import { notFound, forbidden } from '../utils/apiError';

export const createListing = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;

  const listing = await MarketplaceListing.create({
    ...req.body,
    seller: authReq.user!._id,
    images: req.body.images || [],
  });

  sendSuccess(res, { listing }, 'Listing created', 201);
};

export const getListings = async (req: Request, res: Response): Promise<void> => {
  const { skip, limit, page } = paginateQuery(req.query.page as string, req.query.limit as string);
  const filter: Record<string, unknown> = { status: 'active' };

  if (req.query.type) filter.type = req.query.type;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.$text = { $search: req.query.search as string };
  if (req.query.minPrice) filter.price = { ...(filter.price as object || {}), $gte: Number(req.query.minPrice) };
  if (req.query.maxPrice) filter.price = { ...(filter.price as object || {}), $lte: Number(req.query.maxPrice) };

  const [listings, total] = await Promise.all([
    MarketplaceListing.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('seller', 'name username avatar'),
    MarketplaceListing.countDocuments(filter),
  ]);

  sendSuccess(res, { listings, pagination: { page, limit, total } });
};

export const getListingById = async (req: Request, res: Response): Promise<void> => {
  const listing = await MarketplaceListing.findById(req.params.id).populate(
    'seller',
    'name username avatar bio location'
  );
  if (!listing) throw notFound('Listing not found');
  sendSuccess(res, { listing });
};

export const updateListing = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing) throw notFound('Listing not found');
  if (listing.seller.toString() !== authReq.user!._id.toString()) throw forbidden('Not authorized');

  const allowed = ['title', 'description', 'type', 'price', 'currency', 'images', 'category', 'tags', 'status', 'location'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) (listing as unknown as Record<string, unknown>)[key] = req.body[key];
  }

  await listing.save();
  sendSuccess(res, { listing }, 'Listing updated');
};

export const deleteListing = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing) throw notFound('Listing not found');
  if (listing.seller.toString() !== authReq.user!._id.toString()) throw forbidden('Not authorized');

  await listing.deleteOne();
  sendSuccess(res, undefined, 'Listing deleted');
};

export const getMyListings = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { skip, limit } = paginateQuery(req.query.page as string, req.query.limit as string);

  const listings = await MarketplaceListing.find({ seller: authReq.user!._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  sendSuccess(res, { listings });
};
