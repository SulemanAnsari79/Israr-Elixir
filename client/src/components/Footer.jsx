import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Instagram } from 'lucide-react';
import api from '../services/Api.js';

export default function Footer() {
  const [footer, setFooter] = useState({ tagline: 'Thoughtfully chosen fragrances, made to become part of your story.', email: 'support@israrelixir.com', phone: '+91 6386514515', instagramUrl: '' });
  const [brandName, setBrandName] = useState('Israr Elixir');
  useEffect(() => { api.get('/storefront').then(({ data }) => { setFooter((current) => ({ ...current, ...(data.storefront?.footer || {}) })); setBrandName(data.storefront?.brandName || 'Israr Elixir'); }).catch(() => {}); }, []);
  return (
  <footer className="bg-[#24211d] px-6 pb-8 pt-12 text-[#c8bfb3]">
    <div className="mx-auto grid max-w-7xl gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <Link to="/" className="font-serif text-2xl tracking-[.1em] text-white">{brandName}</Link>
        <p className="mt-4 max-w-xs text-sm leading-6">{footer.tagline}</p>
        {footer.instagramUrl ? <a href={footer.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} className="mt-5" /></a> : <Instagram size={18} className="mt-5" />}
      </div>
      <div>
        <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[.18em] text-white">Discover</h3>
        <ul className="space-y-3 text-sm">
          <li><Link to="/products" className="hover:text-white">All fragrances</Link></li>
          <li><Link to="/products" className="hover:text-white">Gift sets</Link></li>
          <li><Link to="/about" className="hover:text-white">Our story</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[.18em] text-white">Customer care</h3>
        <ul className="space-y-3 text-sm">
          <li><Link to="/contact" className="hover:text-white">Shipping & returns</Link></li>
          <li><Link to="/contact" className="hover:text-white">Frequently asked questions</Link></li>
          <li><Link to="/contact" className="hover:text-white">Contact us</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[.18em] text-white">Policies</h3>
        <ul className="space-y-3 text-sm">
          <li><Link to="/policies/terms" className="hover:text-white">Terms & conditions</Link></li>
          <li><Link to="/policies/privacy" className="hover:text-white">Privacy policy</Link></li>
          <li><Link to="/policies/refund" className="hover:text-white">Refund policy</Link></li>
          <li><Link to="/policies/cancellation" className="hover:text-white">Cancellation policy</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[.18em] text-white">Get in touch</h3>
        <Link to="/contact" className="text-sm hover:text-white">Visit our contact page</Link>
        <a href={`mailto:${footer.email}`} className="mt-3 block text-sm hover:text-white">{footer.email}</a>
        <a href={`tel:${footer.phone}`} className="mt-3 block text-sm hover:text-white">{footer.phone}</a>
      </div>
    </div>
    <p className="mx-auto mt-6 max-w-7xl text-center text-[10px]">Copyright 2026 Israr Elixir. Fragrance for the moments that stay.</p>
  </footer>);
}
