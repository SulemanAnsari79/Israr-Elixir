import { useContext, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import ProductCard from '../../components/ProductCard.jsx';

const getProductTags = (product) => (Array.isArray(product.tags) ? product.tags : [])
  .map((tag) => String(tag).trim()).filter(Boolean);

const getAudience = (product) => {
  const text = [product.name, product.category, ...getProductTags(product)].join(' ').toLowerCase();
  if (/\bunisex\b/.test(text)) return 'Unisex';
  if (/\bwomen\b|\bwomens\b|\bwomen's\b|\bfemale\b|\bfeminine\b|\bladies\b/.test(text)) return 'Women';
  if (/\bmen\b|\bmens\b|\bmen's\b|\bmale\b|\bmasculine\b/.test(text)) return 'Men';
  return 'Other';
};

export default function Products() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [audience, setAudience] = useState('All');
  const [selectedStyles, setSelectedStyles] = useState([]);
  const { products = [] } = useContext(AuthContext);

  const categories = useMemo(() => [...new Set(products.map((product) => product.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [products]);
  const styles = useMemo(() => [...new Set(products.flatMap(getProductTags))].sort((a, b) => a.localeCompare(b)), [products]);
  const query = search.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const searchable = [product.name, product.category, product.description, ...getProductTags(product)].join(' ').toLowerCase();
    const matchesSearch = searchable.includes(query);
    const matchesAudience = audience === 'All' || getAudience(product) === audience;
    const matchesCategory = category === 'All' || product.category === category;
    const tags = getProductTags(product);
    const matchesStyle = selectedStyles.length === 0 || selectedStyles.every((style) => tags.includes(style));
    return matchesSearch && matchesAudience && matchesCategory && matchesStyle;
  });

  const audienceOptions = ['All', 'Men', 'Women', 'Unisex'];
  const audienceCount = (value) => value === 'All' ? products.length : products.filter((product) => getAudience(product) === value).length;
  const categoryCount = (value) => products.filter((product) => product.category === value).length;
  const toggleStyle = (style) => setSelectedStyles((current) => current.includes(style) ? current.filter((item) => item !== style) : [...current, style]);
  const clearFilters = () => { setSearch(''); setAudience('All'); setCategory('All'); setSelectedStyles([]); };
  const hasFilters = Boolean(search || audience !== 'All' || category !== 'All' || selectedStyles.length);

  return <div className="store-page amal-collection min-h-screen">
    <Navbar />

    <main className="mx-auto max-w-7xl px-5 pb-20 pt-5 md:px-10 md:pt-5">
      
      <div className="grid gap-9 md:grid-cols-[130px_minmax(0,1fr)] md:gap-10">
        <aside aria-label="Product filters" className="md:sticky md:top-8 md:self-start">
          <div className="mb-5 flex items-center justify-between border-b border-[#e7ded3] pb-3">
            <h2 className="flex items-center gap-2 text-md font-bold uppercase tracking-[.16em] text-[#665a4c]">
              <SlidersHorizontal size={14} /> Filter by
            </h2>
            {hasFilters && 
            <button type="button" onClick={clearFilters} className="text-[9px] uppercase tracking-wider text-[#8b7862] hover:text-[#302a23]">Clear</button>}
          </div>

          {categories.length > 0 && 
          <section className="border-b border-[#e7ded3] py-4">
            <h3 className="mb-3 text-[9px] font-semibold uppercase tracking-[.18em] text-[#8b7862]">Collection</h3>
            <div className="space-y-1">
              {['All', ...categories].map((item) => 
              <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`flex w-full items-center justify-between py-1.5 text-left text-xs transition ${category === item ? 'font-semibold text-[#302a23]' : 'text-[#766c61] hover:text-[#302a23]'}`}>
                <span className="flex items-center gap-2">
                  <span className={`h-3 w-3 border ${category === item ? 'border-[#302a23] bg-[#302a23] shadow-[inset_0_0_0_2px_#f7f2ec]' : 'border-[#cfc3b4]'}`} />
                  {item === 'All' ? 'All collections' : item}
                  </span>
                  {item !== 'All' && 
                  <span className="text-[10px] text-[#9d9388]">
                    {categoryCount(item)}
                  </span>}
              </button>)}
              </div>
            </section>}

          {styles.length > 0 && 
          <section className="py-4">
            <h3 className="mb-3 text-[9px] font-semibold uppercase tracking-[.18em] text-[#8b7862]">Style & notes</h3>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {styles.map((style) => 
              <button key={style} type="button" aria-pressed={selectedStyles.includes(style)} onClick={() => toggleStyle(style)} className={`flex w-full items-center gap-2 py-1.5 text-left text-xs transition ${selectedStyles.includes(style) ? 'font-semibold text-[#302a23]' : 'text-[#766c61] hover:text-[#302a23]'}`}>
                <span className={`flex h-3 w-3 items-center justify-center border ${selectedStyles.includes(style) ? 'border-[#302a23] bg-[#302a23] text-white' : 'border-[#cfc3b4]'}`}>
                  {selectedStyles.includes(style) && 
                  <span className="text-[9px] leading-none">✓</span>}
                </span>
                <span className="capitalize">{style}</span>
              </button>
              )}
            </div>
          </section>}
        </aside>

        <section className="min-w-0" aria-label="Fragrance results">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#e7ded3]  ">
            <label className="flex w-full items-center gap-3 border-b border-[#cfc3b4] pb-2 sm:max-w-xs">
              <Search size={16} strokeWidth={1.6} className="text-[#857665]" />
              <input type="search" aria-label="Search fragrances" placeholder="Search fragrances" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full border-0 bg-transparent p-1 text-sm text-[#342a20] outline-none placeholder:text-[#9d9388] focus:ring-0" />
            </label>
            <div className="flex items-center   gap-">
              {/* <h3 className="mb-3 text-md font-semibold uppercase tracking-[.18em] text-[#8b7862]">For</h3> */}
              <div className="flex gap-10">
                {audienceOptions.map((item) => 
                <button key={item} type="button" aria-pressed={audience === item} onClick={() => setAudience(item)} className={`flex w-full items-center justify-between gap-3 py-1.5 text-left text-xs transition ${audience === item ? 'font-semibold text-[#302a23]' : 'text-[#766c61] hover:text-[#302a23]'}`}>
                  <span className="flex items-center gap-2">
                    <span className={`h-3 w-3 border ${audience === item ? 'border-[#302a23] bg-[#302a23] shadow-[inset_0_0_0_2px_#f7f2ec]' : 'border-[#cfc3b4]'}`} />
                      {item === 'All' ? 'All' : item}
                    </span>
                    <span className="text-[10px] text-[#9d9388]">
                      {audienceCount(item)}
                    </span>
                </button>)}
              </div>
            </div>
            {/* <p className="text-[10px] uppercase tracking-[.12em] text-[#766c61]">Showing {filteredProducts.length} of {products.length}</p> */}
          </div>

          {filteredProducts.length > 0 ? 
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
            {filteredProducts.map((product) => 
            <ProductCard key={product._id} product={product} />)}
          </div> : 
          <div className="border-y border-[#e7ded3] py-20 text-center">
            <Search size={24} strokeWidth={1.4} className="mx-auto mb-4 text-[#907c65]" />
            <h2 className="font-serif text-2xl text-[#302a23]">No fragrances found</h2>
            <p className="mt-2 text-sm text-[#766c61]">Try another name or adjust your filters.</p>
            <button type="button" onClick={clearFilters} className="mt-5 text-[10px] font-semibold uppercase tracking-[.15em] text-[#806345] underline underline-offset-4">Clear filters</button>
          </div>}
        </section>
      </div>
    </main>

    <Footer />
  </div>;
}
