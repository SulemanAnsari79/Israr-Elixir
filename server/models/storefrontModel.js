import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema({
  eyebrow: { type: String, default: 'The Israr Elixir story' },
  title: { type: String, default: 'Fragrance that feels like you.' },
  intro: { type: String, default: 'We believe a fragrance can hold a memory, set a mood, and make the everyday feel special.' },
  storyTitle: { type: String, default: 'A little about us' },
  storyParagraphs: { type: [String], default: [] },
  image: { type: String, default: '' },
}, { _id: false });

const contactSchema = new mongoose.Schema({
  eyebrow: { type: String, default: 'Israr Elixir customer care' },
  title: { type: String, default: 'We’re here to help.' },
  description: { type: String, default: 'Questions about a fragrance, an order, or a gift? Send us a note and our team will be happy to help.' },
  address: { type: String, default: 'New Delhi, India' },
  phone: { type: String, default: '+91 98765 43210' },
  email: { type: String, default: 'support@israrelixir.com' },
  mapEmbedUrl: { type: String, default: '' },
}, { _id: false });

const storefrontSchema = new mongoose.Schema({
  brandName: { type: String, default: 'Israr Elixir' },
  login: {
    backgroundImage: { type: String, default: '' },
    logoImage: { type: String, default: '' },
  },
  about: { type: aboutSchema, default: () => ({}) },
  contact: { type: contactSchema, default: () => ({}) },
  footer: {
    tagline: { type: String, default: 'Thoughtfully chosen fragrances, made to become part of your story.' },
    email: { type: String, default: 'support@israrelixir.com' },
    phone: { type: String, default: '+91 6386514515' },
    instagramUrl: { type: String, default: '' },
  },
}, { timestamps: true });

export default mongoose.model('Storefront', storefrontSchema);
