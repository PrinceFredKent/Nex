import React from 'react';
import Link from 'next/link';
import { Film, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-dark-950 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white font-sans flex items-center gap-2">
                NEX
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Watch full HD movies, TV shows, and series with instant multi-server streaming and automated ingestion.
            </p>
          </div>

          {/* Quick Browse */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Browse Media</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/browse?type=movie" className="hover:text-white transition">Top Movies</Link></li>
              <li><Link href="/browse?type=tv" className="hover:text-white transition">TV Series</Link></li>
              <li><Link href="/browse?sort=views" className="hover:text-white transition">Trending Now</Link></li>
              <li><Link href="/watchlist" className="hover:text-white transition">My Watchlist</Link></li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Top Genres</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/browse?genre=Action" className="hover:text-white transition">Action & Adventure</Link></li>
              <li><Link href="/browse?genre=Science+Fiction" className="hover:text-white transition">Sci-Fi & Fantasy</Link></li>
              <li><Link href="/browse?genre=Drama" className="hover:text-white transition">Drama</Link></li>
              <li><Link href="/browse?genre=Animation" className="hover:text-white transition">Animation</Link></li>
            </ul>
          </div>

          {/* Admin & Legal */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Management</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-semibold transition">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Control Center</span>
                </Link>
              </li>
              <li>
                <Link href="/admin?tab=search" className="hover:text-white transition">
                  Add New Movies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="pt-8 border-t border-white/5 text-center text-xs text-gray-400 space-y-2">
          <p>
            Disclaimer: Nex does not host or store any media files on its servers. All videos and embeds are provided by non-affiliated 3rd-party services.
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-[11px]">
            <span className="font-semibold text-gray-300">Nex</span>
            <span>•</span>
            <span>Built with modern high-performance streaming technology</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
