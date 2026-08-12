import Link from "next/link";
import { Leaf, Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <Leaf className="h-6 w-6" />
              <span className="font-bold text-xl tracking-tight text-green-700">FreshHarvest</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              We deliver the freshest, hand-picked vegetables directly from local farms to your doorstep. Healthy eating made easy.
            </p>
            <div className="flex items-center gap-4 text-gray-400">
              <a href="#" className="hover:text-green-600 transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-green-600 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-green-600 transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-green-600 transition-colors">Home</Link></li>
              <li><Link href="/shop" className="hover:text-green-600 transition-colors">Shop</Link></li>
              <li><Link href="/about" className="hover:text-green-600 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-green-600 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/categories/leafy-vegetables" className="hover:text-green-600 transition-colors">Leafy Vegetables</Link></li>
              <li><Link href="/categories/root-vegetables" className="hover:text-green-600 transition-colors">Root Vegetables</Link></li>
              <li><Link href="/categories/fruits" className="hover:text-green-600 transition-colors">Fresh Fruits</Link></li>
              <li><Link href="/categories/organic" className="hover:text-green-600 transition-colors">Organic Only</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Newsletter</h3>
            <p className="text-sm text-gray-500 mb-4">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
              <button 
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>© {new Date().getFullYear()} FreshHarvest. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-green-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-green-600">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
