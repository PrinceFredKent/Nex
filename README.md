# 🎬 Nex — Online Movie & TV Streaming Platform

**Nex** is a high-performance movie and TV series streaming web application featuring an **Admin Auto-Ingestion Engine** (search any title to automatically pull full metadata, posters, cast, trailers, and multi-server free streaming links).

---

## 🌟 Key Features

### 🛡️ Admin Movie Ingestion Engine
- **Instant Search by Title**: Type any movie or TV series name (e.g., *Inception*, *Avatar*, *House of the Dragon*, *Stranger Things*).
- **Automated Metadata Ingestion**: Automatically fetches high-resolution posters, backdrops, plot summaries, release years, TMDB/IMDb ratings, directors, and top cast members.
- **Auto-Generated Multi-Server Free Streams**: Resolves embed stream links (`VidLink`, `VidSrc Alpha`, `VidSrc VIP`, `SuperEmbed`, `AutoEmbed`, `2Embed`, `SmashyStream`) based on TMDB/IMDb IDs for movies and all seasons/episodes for TV series.
- **Trending Discovery Ingestion**: 1-Click batch import of current trending and popular movies and TV series directly into the catalog.
- **Custom Direct Video Support**: Add custom direct `.mp4`, `.m3u8` (HLS), Google Drive, or custom external iframe video streams.
- **Content & Catalog Manager**: Toggle featured movies on hero carousel, edit metadata, or manage titles.

### 🎥 User Cinema Experience
- **Modern Dashboard UI**: Light ambient theme with floating dock navigation, featured hero cards, and responsive grids.
- **Multi-Server Streaming Player**: Switch servers seamlessly if a provider is buffering.
- **TV Series Episode Selector**: Interactive season & episode browser with quick navigation.
- **Live Search Modal**: Quick title search with keyboard shortcut `⌘K` / `Ctrl+K`.
- **Watchlist & History**: Save favorite titles and track recently watched media.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional - Local or Supabase Cloud)
Copy `.env.example` to `.env.local` and add your Supabase credentials if using cloud sync:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Access Admin Control Center
Navigate to `/admin` or click **Admin Panel** in the left sidebar:
- [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Database**: Dual-Mode (Local JSON Storage + Supabase PostgreSQL)
- **Metadata Provider**: TMDB (The Movie Database API)
- **Streaming Resolvers**: Multi-server embed providers
