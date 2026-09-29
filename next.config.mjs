/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      { source: '/movies', destination: '/browse?type=movie', permanent: false },
      { source: '/movie', destination: '/browse?type=movie', permanent: false },
      { source: '/tv', destination: '/browse?type=tv', permanent: false },
      { source: '/series', destination: '/browse?type=tv', permanent: false },
      { source: '/tv-shows', destination: '/browse?type=tv', permanent: false },
      { source: '/trending', destination: '/browse?sort=views', permanent: false },
      { source: '/favorites', destination: '/watchlist', permanent: false },
      { source: '/favorite', destination: '/watchlist', permanent: false },
      { source: '/settings', destination: '/admin?tab=settings', permanent: false },
      { source: '/login', destination: '/auth/login', permanent: false },
      { source: '/signin', destination: '/auth/login', permanent: false },
      { source: '/register', destination: '/auth/register', permanent: false },
      { source: '/signup', destination: '/auth/register', permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**",
      }
    ],
  },
};

export default nextConfig;
