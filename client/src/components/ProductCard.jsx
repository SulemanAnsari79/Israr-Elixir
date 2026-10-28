import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContextDefinition.js';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(AuthContext);
  const image = Array.isArray(product.images) ? product.images[0] : product.images;

  return( <article className="amal-product-card rounded-2xl  group min-w-0">
    <Link to={`/product/${product._id}`} aria-label={`View ${product.name}`} className="relative mb-4 block aspect-[.83] overflow-hidden bg-[#f1ece5]">
      <img src={image || '/placeholder-image.jpg'} alt={product.name || 'Fragrance'} loading="lazy" className="h-full w-full object-contain p-5 mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.045] sm:p-7" />
      {product.discount > 0 && <span className="absolute left-3 top-3 bg-[#302a23] px-2 py-1 text-[8px] font-semibold uppercase tracking-[.12em] text-white">-{product.discount}%</span>}
      <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-[#fffdfa] text-[#302a23] opacity-0 shadow-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={16} strokeWidth={1.5} /></span>
    </Link>

    <div className="flex  min-h-[92px] flex-col">
      <p className="mb-1 truncate text-[8px] font-medium uppercase tracking-[.18em] text-[#8b7862]">{product.category || 'Perfume'}</p>
      <Link to={`/product/${product._id}`} className="line-clamp-2 font-serif text-lg leading-tight text-[#302a23] transition hover:text-[#806345]">{product.name}</Link>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <span className="text-xs font-medium text-[#3f352b]">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
        <button type="button" onClick={() => addToCart(product._id)} aria-label={`Add ${product.name} to bag`} className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#d8cbbb] text-[#302a23] transition hover:border-[#302a23] hover:bg-[#302a23] hover:text-white"><Plus size={15} strokeWidth={1.5} /></button>
      </div>
    </div>
  </article>);
}
