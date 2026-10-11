import { useEffect, useState } from 'react';
import { getHomepageSettings, saveHomepageSettings } from '../../services/AdminService.js';
import { toast } from 'react-toastify';

const emptySlide = () => ({ eyebrow: '', title: '', description: '', image: '', buttonText: 'Shop now', buttonLink: '/products' });
const emptyBanner = () => ({ eyebrow: '', title: '', description: '', image: '', buttonText: 'Explore', buttonLink: '/products' });
const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-700 focus:outline-none';

function ContentFields({ value, onChange, kind }) {
  const label = kind === 'slide' ? 'Slide' : 'Banner';
  const update = (key, next) => onChange({ ...value, [key]: next });
  return <div className="grid gap-3 md:grid-cols-2">
    <label className="text-sm font-medium">Small heading<input className={inputClass} value={value.eyebrow || ''} onChange={(e) => update('eyebrow', e.target.value)} /></label>
    <label className="text-sm font-medium">Title<textarea className={inputClass} rows="2" value={value.title || ''} onChange={(e) => update('title', e.target.value)} /></label>
    <label className="text-sm font-medium md:col-span-2">Description<textarea className={inputClass} rows="2" value={value.description || ''} onChange={(e) => update('description', e.target.value)} /></label>
    <label className="text-sm font-medium md:col-span-2">Image URL<input className={inputClass} type="url" placeholder="https://…" value={value.image || ''} onChange={(e) => update('image', e.target.value)} /></label>
    <label className="text-sm font-medium">Button label<input className={inputClass} value={value.buttonText || ''} onChange={(e) => update('buttonText', e.target.value)} /></label>
    <label className="text-sm font-medium">Button link<input className={inputClass} placeholder="/products" value={value.buttonLink || ''} onChange={(e) => update('buttonLink', e.target.value)} /></label>
    {value.image && <img src={value.image} alt={`${label} preview`} className="h-36 w-full rounded-lg bg-gray-100 object-cover md:col-span-2" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
  </div>;
}

export default function ManageHomepage() {
  const [content, setContent] = useState({
    slides: [emptySlide()],
    banners: [],
    featuredTitle: 'Featured fragrances',
    featuredProductIds: [],
    bestSellerTitle: 'Best sellers',
    bestSellerProductIds: [],
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getHomepageSettings().then(({ data }) => {
      setProducts(data.products || []);
      setContent((current) => ({
        ...current,
        ...data.homepage,
        slides: data.homepage?.slides?.length ? data.homepage.slides : [emptySlide()],
        banners: data.homepage?.banners || [],
        featuredProductIds: (data.homepage?.featuredProductIds || []).map(String),
        bestSellerTitle: data.homepage?.bestSellerTitle || 'Best sellers',
        bestSellerProductIds: (data.homepage?.bestSellerProductIds || []).map(String),
      }));
    }).catch(() => toast.error('Could not load homepage settings')).finally(() => setLoading(false));
  }, []);

  const updateItem = (key, index, value) => setContent((current) => ({ ...current, [key]: current[key].map((item, itemIndex) => itemIndex === index ? value : item) }));
  const removeItem = (key, index) => setContent((current) => ({ ...current, [key]: current[key].filter((_, itemIndex) => itemIndex !== index) }));
  const save = async (event) => {
    event.preventDefault();
    if (!content.slides.length || content.slides.some((slide) => !slide.title.trim() || !slide.image.trim())) return toast.error('Each hero slide needs a title and image URL');
    setSaving(true);
    try { await saveHomepageSettings(content); toast.success('Homepage saved'); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not save homepage'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading homepage settings…</div>;

  return (
  <form onSubmit={save} className="mx-auto max-w-5xl space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-800">Storefront</p>
        <h1 className="mt-1 text-3xl font-semibold text-gray-900">Homepage layout</h1>
        <p className="mt-2 text-sm text-gray-500">Edit carousel slides, promotional banners, and the featured fragrance selection.</p>
      </div>
      <button disabled={saving} className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>
    </div>

    <section className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Hero carousel</h2>
          <p className="text-sm text-gray-500">Slides rotate automatically on the storefront.</p>
        </div>
        <button type="button" onClick={() => setContent((c) => ({ ...c, slides: [...c.slides, emptySlide()] }))} className="rounded-lg border px-3 py-2 text-sm">Add slide</button>
      </div>
      {content.slides.map((slide, index) => <div key={slide._id || index} className="space-y-3 rounded-lg border p-4"><div className="flex items-center justify-between"><h3 className="font-semibold">Slide {index + 1}</h3>{content.slides.length > 1 && <button type="button" onClick={() => removeItem('slides', index)} className="text-sm text-red-600">Remove</button>}</div><ContentFields kind="slide" value={slide} onChange={(value) => updateItem('slides', index, value)} /></div>)}
    </section>

    <section className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Promotional banners</h2>
          <p className="text-sm text-gray-500">Add the two image panels below featured products.</p>
        </div>
        <button type="button" onClick={() => setContent((c) => ({ ...c, banners: [...c.banners, emptyBanner()] }))} className="rounded-lg border px-3 py-2 text-sm">Add banner</button>
      </div>
      {content.banners.length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">No banners yet. Add a banner to show it on the storefront.</p>}
      {content.banners.map((banner, index) => <div key={banner._id || index} className="space-y-3 rounded-lg border p-4"><div className="flex items-center justify-between"><h3 className="font-semibold">Banner {index + 1}</h3><button type="button" onClick={() => removeItem('banners', index)} className="text-sm text-red-600">Remove</button></div><ContentFields kind="banner" value={banner} onChange={(value) => updateItem('banners', index, value)} /></div>)}
    </section>

    <section className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Featured fragrances</h2>
        <p className="text-sm text-gray-500">Choose products and set the section heading. With nothing selected, active best sellers appear automatically.</p>
      </div>
      <label className="block text-sm font-medium">Section heading
        <input className={inputClass} value={content.featuredTitle || ''} onChange={(e) => setContent((c) => ({ ...c, featuredTitle: e.target.value }))} />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {products.map((product) => 
          <label key={product._id} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
          <input type="checkbox" checked={content.featuredProductIds.includes(product._id)} onChange={(e) => setContent((c) => ({ ...c, featuredProductIds: e.target.checked ? [...c.featuredProductIds, product._id] : c.featuredProductIds.filter((id) => id !== product._id) }))} />
          <img src={product.images?.[0]} alt="" className="h-12 w-12 rounded object-cover" />
          <span className="min-w-0"><span className="block truncate text-sm font-medium">{product.name}</span>
          <span className="text-xs text-gray-500">{product.category} · ₹{product.price}</span>
          </span>
          </label>)}
      </div>
      {products.length === 0 && <p className="text-sm text-gray-500">Add products first to select them here.</p>}
    </section>

    <section className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Best sellers</h2>
        <p className="text-sm text-gray-500">Choose the products shown in the separate Best Sellers section on the home page.</p>
      </div>
      <label className="block text-sm font-medium">Section heading
        <input className={inputClass} value={content.bestSellerTitle || ''} onChange={(e) => setContent((c) => ({ ...c, bestSellerTitle: e.target.value }))} />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {products.map((product) =>
          <label key={product._id} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
            <input
              type="checkbox"
              checked={content.bestSellerProductIds.includes(product._id)}
              onChange={(e) => setContent((c) => ({
                ...c,
                bestSellerProductIds: e.target.checked
                  ? [...c.bestSellerProductIds, product._id]
                  : c.bestSellerProductIds.filter((id) => id !== product._id),
              }))}
            />
            <img src={product.images?.[0]} alt="" className="h-12 w-12 rounded object-cover" />
            <span className="min-w-0"><span className="block truncate text-sm font-medium">{product.name}</span>
              <span className="text-xs text-gray-500">{product.category} · ₹{product.price}</span>
            </span>
          </label>)}
      </div>
      {products.length === 0 && <p className="text-sm text-gray-500">Add products first to select them here.</p>}
    </section>

    <div className="flex justify-end">
      <button disabled={saving} className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>
    </div>
  </form>
  );
}
