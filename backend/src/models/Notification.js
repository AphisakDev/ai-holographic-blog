import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: String,
      required: true,
      index: true // 'admin' or userId
    },
    senderName: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'article'],
      required: true
    },
    articleId: {
      type: String,
      default: ''
    },
    articleTitle: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
