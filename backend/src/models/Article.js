import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: ''
    },
    category_id: {
      type: Number,
      default: 1
    },
    thumbnailUrl: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    },
    status_id: {
      type: Number,
      default: 1
    },
    author: {
      type: String,
      default: 'Admin'
    },
    likes: {
      type: Number,
      default: 15
    },
    likedBy: [{
      type: String
    }]
  },
  {
    timestamps: true
  }
);

articleSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.customId || ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Article = mongoose.model('Article', articleSchema);
export default Article;
