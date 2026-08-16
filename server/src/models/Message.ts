import mongoose, { Document, Schema, Types } from 'mongoose';

export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'emoji';

export interface IReaction {
  user: Types.ObjectId;
  emoji: string;
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  type: MessageType;
  mediaUrl?: string;
  reactions: IReaction[];
  seenBy: Types.ObjectId[];
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'voice', 'emoji'],
      default: 'text',
    },
    mediaUrl: { type: String },
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        emoji: { type: String },
      },
    ],
    seenBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
