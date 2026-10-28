import { createElement, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Gift, Heart, Leaf, Menu, PackageCheck, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { AuthContext } from '../context/AuthContextDefinition.js';
import api from '../services/Api.js';

const fallbackSlide = {
  eyebrow: 'A fragrance for every moment',
  title: 'Find your\nsignature scent.',
  description: 'Discover memorable fragrances, thoughtfully chosen for every day and every occasion.',
  image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1800&q=85',
  buttonText: 'Explore collection',
  buttonLink: '/products',
};

const shortcuts = [
  { label: 'Women’s perfumes', match: 'women', icon: Sparkles },
  { label: 'Men’s perfumes', match: 'men', icon: Menu },
  { label: 'Unisex fragrances', match: 'unisex', icon: Heart },
  { label: 'Gift sets', match: 'gift', icon: Gift },
  { label: 'Perfume oils', match: 'oil', icon: Leaf },
  { label: 'Discovery sets', match: 'discovery', icon: PackageCheck },
];

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function Hero() {
  const { products: contextProducts = [], addToCart } = useContext(AuthContext);
  const [homepage, setHomepage] = useState({
    slides: [fallbackSlide],
    banners: [],
    featuredTitle: 'Featured fragrances',
    featuredProducts: [],
    bestSellerTitle: 'Best sellers',
    bestSellerProducts: [],
    categories: [],
  });
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    api.get('/homepage').then(({ data }) => { if (data?.homepage) setHomepage((current) => ({ ...current, ...data.homepage })); }).catch(() => {});
  }, []);

  const slides = homepage.slides?.length ? homepage.slides : [fallbackSlide];
  const slide = slides[activeSlide % slides.length] || fallbackSlide;
  const featuredProducts = homepage.featuredProducts?.length ? homepage.featuredProducts : contextProducts.filter((product) => product.isActive !== false && product.bestSeller).slice(0, 5);
  const bestSellerProducts = homepage.bestSellerProducts || [];

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const categoryItems = homepage.categories?.length
    ? homepage.categories.slice(0, 6).map((name, index) => ({ label: name, match: name, icon: shortcuts[index % shortcuts.length].icon }))
    : shortcuts;
  const categoryLink = (label) => homepage.categories?.includes(label) ? `/products?category=${encodeURIComponent(label)}` : '/products';

  return( 
  <main className="bg-[#f7f2ec] pb-10 font-['Plus_Jakarta_Sans'] text-[#25221e]">
    <section className="relative isolate min-h-[470px] overflow-hidden bg-[#e9dfd1] md:min-h-[530px]">
      <img key={slide.image} src={slide.image} alt="Featured fragrance" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f2e9dc]/95 via-[#f2e9dc]/75 to-transparent md:via-[#f2e9dc]/45" />
      <div className="mx-auto flex min-h-[470px] max-w-7xl items-center px-6 py-14 md:min-h-[530px] md:px-12">
        <div className="max-w-xl">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[.28em] text-[#715944]">{slide.eyebrow || 'A fragrance for every moment'}</p>
          <h1 className="whitespace-pre-line font-serif text-5xl leading-[.98] tracking-[-.04em] text-[#24201c] md:text-7xl">{slide.title || fallbackSlide.title}</h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-[#5e554c] md:text-base">{slide.description}</p>
          <Link to={slide.buttonLink || '/products'} className="mt-7 inline-flex items-center gap-4 bg-[#161512] px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-white transition hover:bg-[#795c3c]">{slide.buttonText || 'Explore collection'}<ArrowRight size={15} /></Link>
        </div>
      </div>
      {slides.length > 1 && <div className="absolute bottom-6 right-6 flex items-center gap-2 md:right-12">{slides.map((item, index) => <button key={item._id || index} aria-label={`Show slide ${index + 1}`} onClick={() => setActiveSlide(index)} className={`h-1.5 rounded-full transition-all ${index === activeSlide ? 'w-8 bg-[#30271f]' : 'w-3 bg-[#30271f]/35'}`} />)}</div>}
    </section>

    {/* Category Section */}
    <section className="mx-auto -mt-5 relative z-10 max-w-7xl px-4 md:px-6">
      <div className="grid grid-cols-3 overflow-hidden rounded-md border border-[#e9e0d7] bg-[#fbf8f4] shadow-sm md:grid-cols-6">
        {categoryItems.map(({ label, match, icon }) => <Link key={label} to={categoryLink(match)} className="group flex min-h-24 flex-col items-center justify-center gap-2 border-r border-[#eee7df] px-2 py-4 text-center last:border-0 hover:bg-white md:min-h-28">
          {createElement(icon, { size: 19, strokeWidth: 1.35, className: 'text-[#6d5945] transition-transform group-hover:-translate-y-0.5' })}
          <span className="max-w-24 text-[8px] font-bold uppercase leading-3 tracking-[.1em] md:text-[9px]">{label}</span>
        </Link>)}
      </div>
    </section>

    {/* Bestseller Section */}
    <section className="mx-auto max-w-7xl px-5 pb-8 pt-10 md:px-10 md:pt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[.23em] text-[#896e51]">Our edit</p>
          <h2 className="font-serif text-3xl capitalize md:text-4xl">{homepage.featuredTitle || 'Featured fragrances'}</h2>
        </div>
        <Link to="/products" className="mb-1 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.13em] hover:text-[#896e51]">
          View all fragrances 
          <ArrowRight size={13} />
        </Link>
      </div>
      {featuredProducts.length ? 
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 md:gap-4">
        {featuredProducts.slice(0, 5).map((product) => 
          <article key={product._id} className="group min-w-0 bg-[#fffdfa] p-2.5 shadow-[0_2px_12px_rgba(48,39,31,.04)] md:p-3">
            <Link to={`/product/${product._id}`} className="relative block aspect-[.92] overflow-hidden bg-[#eee8df]">
            <img src={product.images?.[0] || '/placeholder-image.jpg'} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />{product.discount > 0 && <span className="absolute left-2 top-2 bg-white/90 px-2 py-1 text-[8px] font-bold uppercase tracking-wider">{product.discount}% off</span>}
            </Link>
            <div className="px-0.5 pb-1 pt-3">
              <p className="truncate text-[8px] uppercase tracking-[.15em] text-[#8b7a69]">{product.category}</p>
              <Link to={`/product/${product._id}`} className="mt-1 block truncate font-serif text-sm md:text-base">{product.name}</Link>
            <div className="mt-2 flex items-center justify-between gap-2"><span className="text-[10px] font-semibold">{money(product.price)}</span><button aria-label={`Add ${product.name} to cart`} onClick={() => addToCart?.(product._id)} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#26231f] text-white transition hover:bg-[#896e51]"><span className="text-lg leading-none">+</span></button></div></div>
          </article>)
        }
        </div> : 
        <div className="rounded bg-white/60 p-8 text-center text-sm text-[#776c61]">New fragrances are coming soon.</div>
      }
    </section>

    {bestSellerProducts.length > 0 && <section className="mx-auto max-w-7xl px-5 pb-8 pt-2 md:px-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[.23em] text-[#896e51]">Customer favourites</p>
          <h2 className="font-serif text-3xl capitalize md:text-4xl">{homepage.bestSellerTitle || 'Best sellers'}</h2>
        </div>
        <Link to="/products" className="mb-1 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.13em] hover:text-[#896e51]">
          Shop best sellers
          <ArrowRight size={13} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 md:gap-4">
        {bestSellerProducts.slice(0, 5).map((product) =>
          <article key={product._id} className="group min-w-0 bg-[#fffdfa] p-2.5 shadow-[0_2px_12px_rgba(48,39,31,.04)] md:p-3">
            <Link to={`/product/${product._id}`} className="relative block aspect-[.92] overflow-hidden bg-[#eee8df]">
              <img src={product.images?.[0] || '/placeholder-image.jpg'} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {product.discount > 0 && <span className="absolute left-2 top-2 bg-white/90 px-2 py-1 text-[8px] font-bold uppercase tracking-wider">{product.discount}% off</span>}
            </Link>
            <div className="px-0.5 pb-1 pt-3">
              <p className="truncate text-[8px] uppercase tracking-[.15em] text-[#8b7a69]">{product.category}</p>
              <Link to={`/product/${product._id}`} className="mt-1 block truncate font-serif text-sm md:text-base">{product.name}</Link>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold">{money(product.price)}</span>
                <button aria-label={`Add ${product.name} to cart`} onClick={() => addToCart?.(product._id)} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#26231f] text-white transition hover:bg-[#896e51]"><span className="text-lg leading-none">+</span></button>
              </div>
            </div>
          </article>)}
      </div>
    </section>}

    {homepage.banners?.length > 0 && <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-9 md:grid-cols-2 md:px-10">{homepage.banners.slice(0, 2).map((banner, index) => <article key={banner._id || index} className="relative flex min-h-44 items-center overflow-hidden bg-[#d8c7b2] p-6 md:min-h-52 md:p-9"><img src={banner.image} alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-[#efe4d7]/95 via-[#efe4d7]/75 to-transparent" /><div className="relative max-w-[65%]"><p className="text-[8px] font-bold uppercase tracking-[.2em] text-[#755d43]">{banner.eyebrow}</p><h2 className="mt-2 font-serif text-2xl leading-tight md:text-3xl">{banner.title}</h2><p className="mt-2 line-clamp-2 text-xs text-[#5f5448]">{banner.description}</p><Link to={banner.buttonLink || '/products'} className="mt-4 inline-flex items-center gap-2 bg-white/75 px-3 py-2 text-[8px] font-bold uppercase tracking-wider">{banner.buttonText || 'Explore'}<ArrowUpRight size={12} /></Link></div></article>)}</section>}


    <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 border-t border-[#e9dfd4] px-5 pt-7 md:grid-cols-4 md:px-10">
      {[
        { icon: Truck, title: 'Complimentary shipping', text: 'On orders over ₹2,500' }, 
        { icon: Sparkles, title: 'Discovery samples', text: 'Find your next favorite' }, 
        { icon: PackageCheck, title: 'Easy returns', text: 'A simple 7 day return policy' }, 
        { icon: ShieldCheck, title: 'Secure checkout', text: 'Protected payments' }
      ].map(({ icon, title, text }) =>
      <div key={title} className="flex items-center gap-3">{createElement(icon, { size: 18, strokeWidth: 1.35, className: 'shrink-0 text-[#7b654c]' })}<div>
      <p className="text-[8px] font-bold uppercase tracking-[.1em]">{title}</p>
      <p className="mt-1 text-[9px] text-[#81776d]">{text}</p></div></div>)}
    </section>
  </main>
  );
}
