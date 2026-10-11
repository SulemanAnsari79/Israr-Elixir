import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  buttonText: { type: String, default: 'Shop now' },
  buttonLink: { type: String, default: '/products' },
}, { _id: true });

const bannerSchema = new mongoose.Schema({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  buttonText: { type: String, default: 'Explore' },
  buttonLink: { type: String, default: '/products' },
}, { _id: true });

const homepageSchema = new mongoose.Schema({
  slides: { type: [slideSchema], default: [] },
  banners: { type: [bannerSchema], default: [] },
  featuredTitle: { type: String, default: 'Featured fragrances' },
  featuredProductIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  bestSellerTitle: { type: String, default: 'Best sellers' },
  bestSellerProductIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
}, { timestamps: true });

export default mongoose.model('Homepage', homepageSchema);
