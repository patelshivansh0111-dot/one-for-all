import mongoose, { Document, Schema, Types } from 'mongoose';

export type NotificationType =
  | 'like'
  | 'comment'
  | 'mention'
  | 'message'
  | 'invite'
  | 'follow'
  | 'event'
  | 'announcement';

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['like', 'comment', 'mention', 'message', 'invite', 'follow', 'event', 'announcement'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
