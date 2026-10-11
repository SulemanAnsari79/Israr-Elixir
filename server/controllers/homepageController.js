import Homepage from '../models/homepageModel.js';
import Product from '../models/productModel.js';

const DEFAULT_SLIDE = {
  eyebrow: 'A fragrance for every moment',
  title: 'Find your\nsignature scent.',
  description: 'Discover memorable fragrances, thoughtfully chosen for every day and every occasion.',
  image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1800&q=85',
  buttonText: 'Explore collection',
  buttonLink: '/products',
};

export const getHomepage = async (_req, res) => {
  try {
    const config = await Homepage.findOne().lean();
    const products = await Product.find({ isActive: true }).sort({ bestSeller: -1, createdAt: -1 }).lean();
    const byId = new Map(products.map((product) => [String(product._id), product]));
    const featured = config?.featuredProductIds?.length
      ? config.featuredProductIds.map((id) => byId.get(String(id))).filter(Boolean)
      : products.filter((product) => product.bestSeller).slice(0, 5);
    const bestSellers = config?.bestSellerProductIds?.length
      ? config.bestSellerProductIds.map((id) => byId.get(String(id))).filter(Boolean)
      : [];

    res.json({
      success: true,
      homepage: {
        slides: config?.slides?.length ? config.slides : [DEFAULT_SLIDE],
        banners: config?.banners || [],
        featuredTitle: config?.featuredTitle || 'Featured fragrances',
        featuredProducts: featured,
        bestSellerTitle: config?.bestSellerTitle || 'Best sellers',
        bestSellerProducts: bestSellers,
        categories: [...new Set(products.map((product) => product.category).filter(Boolean))],
      },
    });
  } catch (error) {
    console.error('Get homepage error:', error);
    res.status(500).json({ success: false, message: 'Could not load homepage' });
  }
};

export const getHomepageAdmin = async (_req, res) => {
  try {
    const config = await Homepage.findOne().lean();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      homepage: config || {
        slides: [DEFAULT_SLIDE],
        banners: [],
        featuredTitle: 'Featured fragrances',
        featuredProductIds: [],
        bestSellerTitle: 'Best sellers',
        bestSellerProductIds: [],
      },
      products,
    });
  } catch (error) {
    console.error('Get homepage settings error:', error);
    res.status(500).json({ success: false, message: 'Could not load homepage settings' });
  }
};

export const updateHomepage = async (req, res) => {
  try {
    const {
      slides,
      banners,
      featuredTitle,
      featuredProductIds,
      bestSellerTitle,
      bestSellerProductIds,
    } = req.body;
    if (!Array.isArray(slides) || slides.length === 0) {
      return res.status(400).json({ success: false, message: 'Add at least one hero slide' });
    }
    const config = await Homepage.findOneAndUpdate(
      {},
      {
        slides,
        banners: Array.isArray(banners) ? banners : [],
        featuredTitle: featuredTitle || 'Featured fragrances',
        featuredProductIds: Array.isArray(featuredProductIds) ? featuredProductIds : [],
        bestSellerTitle: bestSellerTitle || 'Best sellers',
        bestSellerProductIds: Array.isArray(bestSellerProductIds) ? bestSellerProductIds : [],
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    res.json({ success: true, homepage: config, message: 'Homepage updated' });
  } catch (error) {
    console.error('Update homepage error:', error);
    res.status(500).json({ success: false, message: 'Could not save homepage settings' });
  }
};
