import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

categorySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.customId || ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
