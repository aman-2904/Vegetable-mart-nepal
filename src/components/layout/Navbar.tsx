"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { usePathname, useRouter } from "next/navigation";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const items = useCart((state) => state.items);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? items.reduce((total, item) => total + item.quantity, 0) : 0;
  
  // Calculate total price based on discount or regular price
  const totalPrice = mounted ? items.reduce((total, item) => {
    const price = item.product.discount_price || item.product.price;
    return total + (price * item.quantity);
  }, 0) : 0;

  const closeMenu = () => setIsMobileMenuOpen(false);

  const navLinks = [
    { href: "/shop", label: "Shop All" },
    { href: "/categories/leafy-greens", label: "Categories" },
    { href: "/shop?sort=newest", label: "New Arrivals" },
    { href: "/shop?sort=popular", label: "Best Sellers" },
    { href: "/recipes", label: "Recipes" },
  ];

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = new FormData(e.currentTarget).get('q');
    if (query) {
      router.push(`/shop?q=${query}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4 lg:gap-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-10 bg-[url('https://cdn-icons-png.flaticon.com/512/3238/3238128.png')] bg-contain bg-no-repeat bg-center" />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">The</span>
            <span className="font-extrabold text-xl text-green-800 tracking-tight leading-tight">Green<br/>Grocer</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              href={link.href}
              className={`text-sm font-bold transition-colors hover:text-green-700 ${pathname === link.href ? 'text-green-700' : 'text-gray-900'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <form onSubmit={handleSearch} className="w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              name="q"
              type="text" 
              placeholder="Search" 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
            />
          </form>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
          <Link href={useCart((state) => state.isAuth) ? "/profile" : "/login"} className="text-gray-500 hover:text-green-700 transition-colors">
            <User className="h-6 w-6" />
            <span className="sr-only">Account</span>
          </Link>
          
          <Link href="/cart" className="flex items-center gap-3 group">
            <div className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-500 group-hover:text-green-700 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-orange-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white box-content">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-sm font-bold text-gray-900">${totalPrice.toFixed(2)} USD</span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <Link href="/cart" className="relative text-gray-600">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-orange-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white box-content">
                {totalItems}
              </span>
            )}
          </Link>
          <button 
            className="text-gray-600 p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white p-4">
          <form onSubmit={handleSearch} className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              name="q"
              type="text" 
              placeholder="Search" 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
            />
          </form>
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.label} 
                href={link.href}
                onClick={closeMenu}
                className="text-base font-bold text-gray-900 hover:text-green-700"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-gray-100 my-2" />
            <Link href={useCart((state) => state.isAuth) ? "/profile" : "/login"} onClick={closeMenu} className="flex items-center gap-2 text-base font-bold text-gray-900 hover:text-green-700">
              <User className="h-5 w-5 text-gray-500" /> Account
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
