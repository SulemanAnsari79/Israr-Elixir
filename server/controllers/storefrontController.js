import Storefront from '../models/storefrontModel.js';
import { v2 as cloudinary } from 'cloudinary';

const defaults = {
  brandName: 'Israr Elixir',
  login: { backgroundImage: '', logoImage: '' },
  about: {
    eyebrow: 'The Israr Elixir story',
    title: 'Fragrance that feels like you.',
    intro: 'We believe a fragrance can hold a memory, set a mood, and make the everyday feel special.',
    storyTitle: 'A little about us',
    storyParagraphs: [],
    image: '',
  },
  contact: {
    eyebrow: 'Israr Elixir customer care',
    title: 'We’re here to help.',
    description: 'Questions about a fragrance, an order, or a gift? Send us a note and our team will be happy to help.',
    address: 'New Delhi, India',
    phone: '+91 98765 43210',
    email: 'support@israrelixir.com',
    mapEmbedUrl: '',
  },
  footer: {
    tagline: 'Thoughtfully chosen fragrances, made to become part of your story.',
    email: 'support@israrelixir.com',
    phone: '+91 6386514515',
    instagramUrl: '',
  },
};

const getSettings = async () => {
  const saved = await Storefront.findOne().lean();
  return {
    ...defaults,
    ...saved,
    login: { ...defaults.login, ...(saved?.login || {}) },
    about: { ...defaults.about, ...(saved?.about || {}) },
    contact: { ...defaults.contact, ...(saved?.contact || {}) },
    footer: { ...defaults.footer, ...(saved?.footer || {}) },
  };
};

export const getStorefront = async (_req, res) => {
  try {
    res.json({ success: true, storefront: await getSettings() });
  } catch (error) {
    console.error('Get storefront settings error:', error);
    res.status(500).json({ success: false, message: 'Could not load storefront settings' });
  }
};

export const updateStorefront = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid storefront settings' });
    }

    const storefront = await Storefront.findOneAndUpdate(
      {},
      {
        brandName: payload.brandName || defaults.brandName,
        login: { ...defaults.login, ...(payload.login || {}) },
        about: { ...defaults.about, ...(payload.about || {}) },
        contact: { ...defaults.contact, ...(payload.contact || {}) },
        footer: { ...defaults.footer, ...(payload.footer || {}) },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    res.json({ success: true, storefront, message: 'Storefront settings updated' });
  } catch (error) {
    console.error('Update storefront settings error:', error);
    res.status(500).json({ success: false, message: 'Could not save storefront settings' });
  }
};

export const uploadStorefrontImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Choose an image to upload' });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'storefront', resource_type: 'image' },
        (error, uploadResult) => (error ? reject(error) : resolve(uploadResult)),
      );
      stream.end(req.file.buffer);
    });
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error('Storefront image upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload storefront image' });
  }
};
