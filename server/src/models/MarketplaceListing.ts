import mongoose, { Document, Schema, Types } from 'mongoose';

export type ListingType =
  | 'buy'
  | 'sell'
  | 'exchange'
  | 'service'
  | 'digital'
  | 'freelance'
  | 'hiring';

export type ListingStatus = 'active' | 'sold' | 'closed';

export interface IMarketplaceListing extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  seller: Types.ObjectId;
  type: ListingType;
  price?: number;
  currency: string;
  images: string[];
  category: string;
  tags: string[];
  status: ListingStatus;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const marketplaceListingSchema = new Schema<IMarketplaceListing>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['buy', 'sell', 'exchange', 'service', 'digital', 'freelance', 'hiring'],
      required: true,
    },
    price: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    images: [{ type: String }],
    category: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    status: { type: String, enum: ['active', 'sold', 'closed'], default: 'active' },
    location: { type: String },
  },
  { timestamps: true }
);

marketplaceListingSchema.index({ type: 1, category: 1, status: 1 });
marketplaceListingSchema.index({ title: 'text', description: 'text', tags: 'text' });

const MarketplaceListing = mongoose.model<IMarketplaceListing>(
  'MarketplaceListing',
  marketplaceListingSchema
);
export default MarketplaceListing;
