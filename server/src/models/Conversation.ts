import mongoose, { Document, Schema, Types } from 'mongoose';

export type ConversationType = 'private' | 'group' | 'community' | 'global';

export interface IConversation extends Document {
  _id: Types.ObjectId;
  type: ConversationType;
  participants: Types.ObjectId[];
  community?: Types.ObjectId;
  name?: string;
  avatar?: string;
  lastMessage?: Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: ['private', 'group', 'community', 'global'],
      default: 'private',
    },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    community: { type: Schema.Types.ObjectId, ref: 'Community' },
    name: { type: String },
    avatar: { type: String },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
export default Conversation;
