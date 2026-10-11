import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { getCartCount } = useContext(AuthContext);
  const links = [{ name: 'Home', path: '/' }, { name: 'Collections', path: '/products' }, { name: 'About Us', path: '/about' }, { name: 'Contact', path: '/contact' }];
  const close = () => setIsOpen(false);

  return (
  <header className="relative z-30 bg-[#fbf8f4] font-['Plus_Jakarta_Sans'] text-[#27231e]">
    <div className="bg-[#24211d] px-4 py-2 text-center text-[8px] font-semibold uppercase tracking-[.2em] text-white sm:text-[9px]">Complimentary delivery on orders over ₹2,500</div>
    <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-[#e9e1d7] px-5 py-4 md:px-10">
      <button onClick={() => setIsOpen((open) => !open)} className="p-2 lg:hidden" aria-label={isOpen ? 'Close menu' : 'Open menu'}>{isOpen ? <X size={20} /> : <Menu size={20} />}</button>
      <Link to="/" className="font-serif text-2xl tracking-[.1em] md:text-3xl">Israr<span className="ml-2 align-middle font-sans text-[8px] tracking-[.27em]">Elixer</span></Link>
      <div className="hidden items-center gap-8 lg:flex">{links.map((link) => <Link key={link.path} to={link.path} className="text-[9px] font-semibold uppercase tracking-[.15em] text-[#62594f] transition hover:text-[#a47a4e]">{link.name}</Link>)}</div>
      <div className="flex items-center gap-2"><Link to="/products" className="p-2" aria-label="Browse fragrances"><Search size={18} strokeWidth={1.5} /></Link><Link to="/profile" className="hidden p-2 sm:block" aria-label="Your account"><UserRound size={18} strokeWidth={1.5} /></Link><Link to="/cart" className="relative p-2" aria-label="Shopping bag"><ShoppingBag size={18} strokeWidth={1.5} /><span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#24211d] px-1 text-[8px] text-white">{getCartCount()}</span></Link></div>
    </nav>
    {isOpen && <div className="absolute left-0 right-0 top-full border-b border-[#e9e1d7] bg-[#fbf8f4] px-6 py-5 shadow-lg lg:hidden">{links.map((link) => <Link key={link.path} to={link.path} onClick={close} className="block border-b border-[#eee7df] py-3 font-serif text-lg">{link.name}</Link>)}</div>}
  </header>
  );
}
