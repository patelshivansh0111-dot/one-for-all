import mongoose, { Document, Schema, Types } from 'mongoose';

export type EventType =
  | 'meetup'
  | 'hackathon'
  | 'gaming'
  | 'study'
  | 'sports'
  | 'workshop'
  | 'online';

export type RSVPStatus = 'going' | 'interested' | 'not_going';

export interface IAttendee {
  user: Types.ObjectId;
  status: RSVPStatus;
}

export interface IEvent extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  type: EventType;
  host: Types.ObjectId;
  community?: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  location?: string;
  coordinates?: { lat: number; lng: number };
  isOnline: boolean;
  meetingLink?: string;
  coverImage?: string;
  attendees: IAttendee[];
  maxAttendees?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    type: {
      type: String,
      enum: ['meetup', 'hackathon', 'gaming', 'study', 'sports', 'workshop', 'online'],
      required: true,
    },
    host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    community: { type: Schema.Types.ObjectId, ref: 'Community' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    isOnline: { type: Boolean, default: false },
    meetingLink: { type: String },
    coverImage: { type: String },
    attendees: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
          type: String,
          enum: ['going', 'interested', 'not_going'],
          default: 'interested',
        },
      },
    ],
    maxAttendees: { type: Number },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

eventSchema.index({ startDate: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Event = mongoose.model<IEvent>('Event', eventSchema);
export default Event;
