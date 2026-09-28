import fs from 'fs';
import path from 'path';
import { MediaItem, SystemSettings } from '@/types';
import { generateStreamSources } from './streams';
import { supabase, isSupabaseConfigured } from './supabase';

interface DatabaseSchema {
  movies: MediaItem[];
  settings: SystemSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: 'Nex',
  siteDescription: 'Stream unlimited movies, TV shows, and series in HD with multiple fast servers.',
  tmdbApiKey: '841459a58d04735c026040cd8ab00d02',
  primaryStreamProvider: 'vidlink',
  enableAutoStreams: true,
  disclaimer: 'This site does not store any files on its server. All contents are provided by non-affiliated third parties.',
};

const INITIAL_MEDIA_SEED: MediaItem[] = [
  {
    id: 'movie-avatar-3',
    tmdbId: 83533,
    imdbId: 'tt1757678',
    title: 'AVATAR 3: FIRE AND ASH',
    originalTitle: 'Avatar: Fire and Ash',
    type: 'movie',
    overview: 'Avatar: Fire and Ash is an epic sci-fi adventure that continues the journey of Jake Sully and Neytiri as they protect their family and Pandora from growing threats.',
    tagline: 'The battle for Pandora continues.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/vL5LR6WdxWPjC3U29hR88W9oV4R.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    releaseDate: '2025-12-19',
    rating: 8.2,
    voteCount: 4500,
    runtime: 180,
    genres: ['Science Fiction', 'Adventure', 'Action'],
    cast: [
      { name: 'Sam Worthington', character: 'Jake Sully' },
      { name: 'Zoe Saldaña', character: 'Neytiri' },
      { name: 'Sigourney Weaver', character: 'Kiri' }
    ],
    director: 'James Cameron',
    trailerKey: 'd9MyW72ELq0',
    trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    featured: true,
    trending: true,
    status: 'published',
    views: 45200,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-01T00:00:00Z',
    streams: generateStreamSources('movie', 83533, 'tt1757678')
  },
  {
    id: 'tv-71446',
    tmdbId: 71446,
    imdbId: 'tt6468322',
    title: 'Money Heist',
    originalTitle: 'La Casa de Papel',
    type: 'tv',
    overview: 'To carry out the biggest heist in history, a mysterious man called The Professor recruits a band of eight robbers who have a single characteristic: none of them has anything to lose.',
    tagline: 'The ultimate heist.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbk5rUh1bGWiAbX.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/gFZri2YbFUBulBgSMrXdEILHiBm.jpg',
    releaseDate: '2017-05-02',
    rating: 8.3,
    voteCount: 18500,
    runtime: 50,
    genres: ['Crime', 'Drama'],
    cast: [
      { name: 'Álvaro Morte', character: 'The Professor' },
      { name: 'Úrsula Corberó', character: 'Tokyo' },
      { name: 'Pedro Alonso', character: 'Berlin' }
    ],
    director: 'Álex Pina',
    trailerKey: '_InqQJRqGW4',
    trailerUrl: 'https://www.youtube.com/watch?v=_InqQJRqGW4',
    featured: false,
    trending: true,
    status: 'published',
    views: 38200,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    streams: [],
    seasons: [
      {
        seasonNumber: 1,
        name: 'Season 1',
        episodeCount: 13,
        episodes: [
          {
            id: 'ep-71446-1-1',
            episodeNumber: 1,
            seasonNumber: 1,
            title: 'Episode 1',
            streams: generateStreamSources('tv', 71446, 'tt6468322', 1, 1)
          }
        ]
      }
    ]
  },
  {
    id: 'tv-94997',
    tmdbId: 94997,
    imdbId: 'tt11198330',
    title: 'House of the Dragon',
    originalTitle: 'House of the Dragon',
    type: 'tv',
    overview: 'The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke. Most empires crumble from heights such as these. In the case of the Targaryens, their slow fall begins when King Viserys breaks with a century of tradition by naming his daughter Rhaenyra heir to the Iron Throne.',
    tagline: 'Fire will reign.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1X4h40fcB4WWUmIBK0auT4zRBAV.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/etj5CuMuam3hD6p27objegMiBQG.jpg',
    releaseDate: '2022-08-21',
    rating: 8.4,
    voteCount: 4200,
    runtime: 60,
    genres: ['Drama', 'Sci-Fi & Fantasy', 'Action & Adventure'],
    cast: [
      { name: 'Emma D\'Arcy', character: 'Princess Rhaenyra Targaryen' },
      { name: 'Matt Smith', character: 'Prince Daemon Targaryen' }
    ],
    director: 'Ryan J. Condal',
    trailerKey: 'DotnJ7tTA34',
    trailerUrl: 'https://www.youtube.com/watch?v=DotnJ7tTA34',
    featured: false,
    trending: true,
    status: 'published',
    views: 41200,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    streams: [],
    seasons: [
      {
        seasonNumber: 1,
        name: 'Season 1',
        episodeCount: 10,
        episodes: [
          {
            id: 'ep-94997-1-1',
            episodeNumber: 1,
            seasonNumber: 1,
            title: 'The Heirs of the Dragon',
            streams: generateStreamSources('tv', 94997, 'tt11198330', 1, 1)
          }
        ]
      }
    ]
  },
  {
    id: 'tv-1399',
    tmdbId: 1399,
    imdbId: 'tt0944947',
    title: 'Game of Thrones',
    originalTitle: 'Game of Thrones',
    type: 'tv',
    overview: 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.',
    tagline: 'Winter is Coming.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    releaseDate: '2011-04-17',
    rating: 8.4,
    voteCount: 23000,
    runtime: 60,
    genres: ['Sci-Fi & Fantasy', 'Drama', 'Action & Adventure'],
    cast: [
      { name: 'Emilia Clarke', character: 'Daenerys Targaryen' },
      { name: 'Kit Harington', character: 'Jon Snow' },
      { name: 'Peter Dinklage', character: 'Tyrion Lannister' }
    ],
    director: 'David Benioff',
    trailerKey: 'KPLWWIOCOOQ',
    trailerUrl: 'https://www.youtube.com/watch?v=KPLWWIOCOOQ',
    featured: false,
    trending: true,
    status: 'published',
    views: 65000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    streams: [],
    seasons: [
      {
        seasonNumber: 1,
        name: 'Season 1',
        episodeCount: 10,
        episodes: [
          {
            id: 'ep-1399-1-1',
            episodeNumber: 1,
            seasonNumber: 1,
            title: 'Winter Is Coming',
            streams: generateStreamSources('tv', 1399, 'tt0944947', 1, 1)
          }
        ]
      }
    ]
  },
  {
    id: 'movie-693134',
    tmdbId: 693134,
    imdbId: 'tt15239678',
    title: 'Dune: Part Two',
    originalTitle: 'Dune: Part Two',
    type: 'movie',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    tagline: 'Long live the fighters.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520b2.jpg',
    releaseDate: '2024-02-27',
    rating: 8.2,
    voteCount: 5200,
    runtime: 166,
    genres: ['Science Fiction', 'Adventure'],
    cast: [
      { name: 'Timothée Chalamet', character: 'Paul Atreides', profileUrl: 'https://image.tmdb.org/t/p/w342/BE2sdjpgsa2rNTFa66f7upkaOP.jpg' },
      { name: 'Zendaya', character: 'Chani', profileUrl: 'https://image.tmdb.org/t/p/w342/r3A7dr7emgjIPAQAcLNs3954qp7.jpg' },
      { name: 'Rebecca Ferguson', character: 'Lady Jessica', profileUrl: 'https://image.tmdb.org/t/p/w342/6NRV5k3p1p0q7P4GvWkY3fI6lFk.jpg' },
      { name: 'Javier Bardem', character: 'Stilgar', profileUrl: 'https://image.tmdb.org/t/p/w342/6PjhC4c9f1r1zF3vjU7sBq4W5l6.jpg' }
    ],
    director: 'Denis Villeneuve',
    trailerKey: 'Way9Dexny3w',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    featured: true,
    trending: true,
    status: 'published',
    views: 18450,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
    streams: generateStreamSources('movie', 693134, 'tt15239678')
  },
  {
    id: 'movie-872585',
    tmdbId: 872585,
    imdbId: 'tt15398776',
    title: 'Oppenheimer',
    originalTitle: 'Oppenheimer',
    type: 'movie',
    overview: 'The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II, his leadership of the Manhattan Project\'s Los Alamos Laboratory, and the political fallout thereafter.',
    tagline: 'The world forever changes.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/rM5Y09xC9YNiFAVhyII5nv2LQA0.jpg',
    releaseDate: '2023-07-19',
    rating: 8.1,
    voteCount: 9200,
    runtime: 181,
    genres: ['Drama', 'History'],
    cast: [
      { name: 'Cillian Murphy', character: 'J. Robert Oppenheimer', profileUrl: 'https://image.tmdb.org/t/p/w342/iT63tXz7Z7vj2b8X6q4Vw6N3F0P.jpg' },
      { name: 'Emily Blunt', character: 'Katherine Oppenheimer', profileUrl: 'https://image.tmdb.org/t/p/w342/h1B7E20j1B3gq4F2M8e4U7R9hL8.jpg' },
      { name: 'Matt Damon', character: 'Leslie Groves', profileUrl: 'https://image.tmdb.org/t/p/w342/elSlNg0WqjAonvssyBnx6a1bW1K.jpg' },
      { name: 'Robert Downey Jr.', character: 'Lewis Strauss', profileUrl: 'https://image.tmdb.org/t/p/w342/1YjdSym1jA7LnUXw1p6k4L8sV4e.jpg' }
    ],
    director: 'Christopher Nolan',
    trailerKey: 'uYPbbksJxIg',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    featured: true,
    trending: true,
    status: 'published',
    views: 24200,
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-10T12:00:00Z',
    streams: generateStreamSources('movie', 872585, 'tt15398776')
  },
  {
    id: 'movie-157336',
    tmdbId: 157336,
    imdbId: 'tt0816692',
    title: 'Interstellar',
    originalTitle: 'Interstellar',
    type: 'movie',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/rAiYTsqOdAc0V9avXnGnTyB9aqE.jpg',
    releaseDate: '2014-11-05',
    rating: 8.4,
    voteCount: 35000,
    runtime: 169,
    genres: ['Adventure', 'Drama', 'Science Fiction'],
    cast: [
      { name: 'Matthew McConaughey', character: 'Joseph Cooper' },
      { name: 'Anne Hathaway', character: 'Dr. Amelia Brand' },
      { name: 'Jessica Chastain', character: 'Murphy Cooper' },
      { name: 'Michael Caine', character: 'Professor John Brand' }
    ],
    director: 'Christopher Nolan',
    trailerKey: 'zSWdZVtXT7E',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    featured: true,
    trending: false,
    status: 'published',
    views: 31050,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    streams: generateStreamSources('movie', 157336, 'tt0816692')
  },
  {
    id: 'tv-100088',
    tmdbId: 100088,
    imdbId: 'tt3581920',
    title: 'The Last of Us',
    originalTitle: 'The Last of Us',
    type: 'tv',
    overview: 'Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal, heartbreaking journey, as they both must traverse the U.S. and depend on each other for survival.',
    tagline: 'When you\'re lost in the darkness, look for the light.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2V7JMrne.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
    releaseDate: '2023-01-15',
    rating: 8.6,
    voteCount: 5000,
    runtime: 60,
    genres: ['Drama', 'Action & Adventure', 'Sci-Fi & Fantasy'],
    cast: [
      { name: 'Pedro Pascal', character: 'Joel Miller' },
      { name: 'Bella Ramsey', character: 'Ellie Williams' },
      { name: 'Gabriel Luna', character: 'Tommy Miller' }
    ],
    director: 'Craig Mazin',
    trailerKey: 'uLtkt8BonwM',
    trailerUrl: 'https://www.youtube.com/watch?v=uLtkt8BonwM',
    featured: true,
    trending: true,
    status: 'published',
    views: 29500,
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
    streams: [],
    seasons: [
      {
        seasonNumber: 1,
        name: 'Season 1',
        overview: 'Twenty years after a fungal infection devastates the planet, survivors Joel and Ellie embark on a cross-country mission.',
        posterUrl: 'https://image.tmdb.org/t/p/w342/uKvVjHNqB5VmOrdxqAt2V7JMrne.jpg',
        episodeCount: 9,
        episodes: [
          {
            id: 'ep-100088-1-1',
            episodeNumber: 1,
            seasonNumber: 1,
            title: 'When You\'re Lost in the Darkness',
            overview: 'Twenty years after a fungal outbreak ravages the planet, survivors Joel and Tess are tasked with a mission that could change everything.',
            stillUrl: 'https://image.tmdb.org/t/p/w780/6Lw54zT5sv28AtAOGmxEZFe2RRF.jpg',
            runtime: 81,
            streams: generateStreamSources('tv', 100088, 'tt3581920', 1, 1)
          },
          {
            id: 'ep-100088-1-2',
            episodeNumber: 2,
            seasonNumber: 1,
            title: 'Infected',
            overview: 'After escaping the QZ, Joel and Tess clash over Ellie\'s fate while navigating the ruins of a long-abandoned Boston.',
            stillUrl: 'https://image.tmdb.org/t/p/w780/hPe655vV4l3q8d2s9fGgWzZf5d9.jpg',
            runtime: 53,
            streams: generateStreamSources('tv', 100088, 'tt3581920', 1, 2)
          },
          {
            id: 'ep-100088-1-3',
            episodeNumber: 3,
            seasonNumber: 1,
            title: 'Long, Long Time',
            overview: 'When a stranger approaches his compound, survivalist Bill forges an unlikely connection. Years later, Joel and Ellie seek Bill\'s guidance.',
            stillUrl: 'https://image.tmdb.org/t/p/w780/kKeq6d7y3f5jG6p7q2w9x8f9.jpg',
            runtime: 76,
            streams: generateStreamSources('tv', 100088, 'tt3581920', 1, 3)
          },
          {
            id: 'ep-100088-1-4',
            episodeNumber: 4,
            seasonNumber: 1,
            title: 'Please Hold to My Hand',
            overview: 'After abandoning their truck in Kansas City, Joel and Ellie must escape without drawing the attention of a vindictive rebel leader.',
            stillUrl: 'https://image.tmdb.org/t/p/w780/uLtkt8BonwM.jpg',
            runtime: 45,
            streams: generateStreamSources('tv', 100088, 'tt3581920', 1, 4)
          },
          {
            id: 'ep-100088-1-5',
            episodeNumber: 5,
            seasonNumber: 1,
            title: 'Endure and Survive',
            overview: 'While attempting to evade the rebels, Joel and Ellie cross paths with the most wanted man in Kansas City.',
            stillUrl: 'https://image.tmdb.org/t/p/w780/6Lw54zT5sv28AtAOGmxEZFe2RRF.jpg',
            runtime: 59,
            streams: generateStreamSources('tv', 100088, 'tt3581920', 1, 5)
          }
        ]
      }
    ]
  },
  {
    id: 'tv-66732',
    tmdbId: 66732,
    imdbId: 'tt4574334',
    title: 'Stranger Things',
    originalTitle: 'Stranger Things',
    type: 'tv',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    tagline: 'Every ending has a beginning.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    releaseDate: '2016-07-15',
    rating: 8.6,
    voteCount: 16800,
    runtime: 50,
    genres: ['Sci-Fi & Fantasy', 'Drama', 'Mystery'],
    cast: [
      { name: 'Millie Bobby Brown', character: 'Eleven' },
      { name: 'Finn Wolfhard', character: 'Mike Wheeler' },
      { name: 'David Harbour', character: 'Jim Hopper' },
      { name: 'Winona Ryder', character: 'Joyce Byers' }
    ],
    director: 'The Duffer Brothers',
    trailerKey: 'b9EkMc79ZSU',
    trailerUrl: 'https://www.youtube.com/watch?v=b9EkMc79ZSU',
    featured: true,
    trending: true,
    status: 'published',
    views: 45000,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
    streams: [],
    seasons: [
      {
        seasonNumber: 1,
        name: 'Season 1',
        overview: 'A young boy vanishes without a trace. As friends, family and local police search for answers, they are drawn into an extraordinary mystery.',
        posterUrl: 'https://image.tmdb.org/t/p/w342/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
        episodeCount: 8,
        episodes: [
          {
            id: 'ep-66732-1-1',
            episodeNumber: 1,
            seasonNumber: 1,
            title: 'Chapter One: The Vanishing of Will Byers',
            overview: 'On his way home from a friend\'s house, young Will sees something terrifying. Nearby, a sinister secret lurks in the depths of a government lab.',
            stillUrl: 'https://image.tmdb.org/t/p/w780/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
            runtime: 48,
            streams: generateStreamSources('tv', 66732, 'tt4574334', 1, 1)
          },
          {
            id: 'ep-66732-1-2',
            episodeNumber: 2,
            seasonNumber: 1,
            title: 'Chapter Two: The Weirdo on Maple Street',
            overview: 'Lucas, Mike and Dustin try to talk to the girl they found in the woods. Hopper questions an anxious Joyce about an unsettling phone call.',
            stillUrl: 'https://image.tmdb.org/t/p/w780/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
            runtime: 55,
            streams: generateStreamSources('tv', 66732, 'tt4574334', 1, 2)
          },
          {
            id: 'ep-66732-1-3',
            episodeNumber: 3,
            seasonNumber: 1,
            title: 'Chapter Three: Holly, Jolly',
            overview: 'An increasingly concerned Nancy looks for Barb and finds out what Jonathan\'s been up to. Joyce is convinced Will is trying to talk to her.',
            stillUrl: 'https://image.tmdb.org/t/p/w780/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
            runtime: 51,
            streams: generateStreamSources('tv', 66732, 'tt4574334', 1, 3)
          }
        ]
      }
    ]
  },
  {
    id: 'movie-569094',
    tmdbId: 569094,
    imdbId: 'tt9362722',
    title: 'Spider-Man: Across the Spider-Verse',
    originalTitle: 'Spider-Man: Across the Spider-Verse',
    type: 'movie',
    overview: 'After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider-Society, a team of Spider-Heroes charged with protecting the Multiverse’s very existence.',
    tagline: 'It\'s how you wear the mask that matters.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    releaseDate: '2023-05-31',
    rating: 8.4,
    voteCount: 6800,
    runtime: 140,
    genres: ['Animation', 'Action', 'Adventure', 'Science Fiction'],
    cast: [
      { name: 'Shameik Moore', character: 'Miles Morales (voice)' },
      { name: 'Hailee Steinfeld', character: 'Gwen Stacy (voice)' },
      { name: 'Oscar Isaac', character: 'Miguel O\'Hara (voice)' }
    ],
    director: 'Joaquim Dos Santos',
    trailerKey: 'cqGjhVJWtEg',
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    featured: false,
    trending: true,
    status: 'published',
    views: 19800,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    streams: generateStreamSources('movie', 569094, 'tt9362722')
  },
  {
    id: 'movie-27205',
    tmdbId: 27205,
    imdbId: 'tt1375666',
    title: 'Inception',
    originalTitle: 'Inception',
    type: 'movie',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    tagline: 'Your mind is the scene of the crime.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    releaseDate: '2010-07-15',
    rating: 8.4,
    voteCount: 36000,
    runtime: 148,
    genres: ['Action', 'Science Fiction', 'Adventure'],
    cast: [
      { name: 'Leonardo DiCaprio', character: 'Dom Cobb' },
      { name: 'Joseph Gordon-Levitt', character: 'Arthur' },
      { name: 'Elliot Page', character: 'Ariadne' },
      { name: 'Tom Hardy', character: 'Eames' }
    ],
    director: 'Christopher Nolan',
    trailerKey: 'YoHD9XEInc0',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    featured: false,
    trending: false,
    status: 'published',
    views: 42100,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    streams: generateStreamSources('movie', 27205, 'tt1375666')
  }
];

function ensureDbExists(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      movies: INITIAL_MEDIA_SEED,
      settings: DEFAULT_SETTINGS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.movies || !Array.isArray(parsed.movies)) {
      parsed.movies = INITIAL_MEDIA_SEED;
    }
    if (!parsed.settings) {
      parsed.settings = DEFAULT_SETTINGS;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading db.json, recreating defaults...', err);
    const initialData: DatabaseSchema = {
      movies: INITIAL_MEDIA_SEED,
      settings: DEFAULT_SETTINGS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveDb(data: DatabaseSchema): void {
  ensureDbExists();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function syncSupabaseUpsert(data: any) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('movies').upsert(data);
  } catch (e) {
    console.error('Supabase upsert error:', e);
  }
}

async function syncSupabaseInsert(data: any) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('movies').insert(data);
  } catch (e) {
    console.error('Supabase insert error:', e);
  }
}

async function syncSupabaseUpdate(id: string, data: any) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('movies').update(data).eq('id', id);
  } catch (e) {
    console.error('Supabase update error:', e);
  }
}

async function syncSupabaseDelete(id: string) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('movies').delete().eq('id', id);
  } catch (e) {
    console.error('Supabase delete error:', e);
  }
}

// Database operations
export const db = {
  getAll: (query?: { type?: string; genre?: string; search?: string; status?: string; sort?: string }): MediaItem[] => {
    const { movies } = ensureDbExists();
    let results = [...movies];

    if (query?.status) {
      results = results.filter(m => m.status === query.status);
    }

    if (query?.type && query.type !== 'all') {
      results = results.filter(m => m.type === query.type);
    }

    if (query?.genre && query.genre !== 'all') {
      const g = query.genre.toLowerCase();
      results = results.filter(m => m.genres.some(genre => genre.toLowerCase().includes(g)));
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.toLowerCase().trim();
      results = results.filter(m => 
        m.title.toLowerCase().includes(q) ||
        (m.originalTitle && m.originalTitle.toLowerCase().includes(q)) ||
        m.overview.toLowerCase().includes(q) ||
        m.genres.some(g => g.toLowerCase().includes(q)) ||
        m.cast.some(c => c.name.toLowerCase().includes(q))
      );
    }

    if (query?.sort) {
      switch (query.sort) {
        case 'rating':
          results.sort((a, b) => b.rating - a.rating);
          break;
        case 'views':
          results.sort((a, b) => b.views - a.views);
          break;
        case 'newest':
          results.sort((a, b) => new Date(b.releaseDate || b.createdAt).getTime() - new Date(a.releaseDate || a.createdAt).getTime());
          break;
        case 'title':
          results.sort((a, b) => a.title.localeCompare(b.title));
          break;
        default:
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return results;
  },

  getById: (id: string): MediaItem | undefined => {
    const { movies } = ensureDbExists();
    return movies.find(m => m.id === id || String(m.tmdbId) === id || m.imdbId === id);
  },

  create: (item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt' | 'views'> & { id?: string }): MediaItem => {
    const current = ensureDbExists();
    const id = item.id || (item.tmdbId ? `${item.type}-${item.tmdbId}` : `custom-${Date.now()}`);
    
    // Check if already exists
    const existingIndex = current.movies.findIndex(m => m.id === id || (item.tmdbId && m.tmdbId === item.tmdbId && m.type === item.type));
    
    const now = new Date().toISOString();
    const newItem: MediaItem = {
      ...item,
      id,
      views: 0,
      createdAt: now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      current.movies[existingIndex] = {
        ...current.movies[existingIndex],
        ...newItem,
        id: current.movies[existingIndex].id,
        views: current.movies[existingIndex].views,
        createdAt: current.movies[existingIndex].createdAt,
        updatedAt: now,
      };
      saveDb(current);

      syncSupabaseUpsert({
        id: current.movies[existingIndex].id,
        tmdb_id: current.movies[existingIndex].tmdbId,
        imdb_id: current.movies[existingIndex].imdbId,
        title: current.movies[existingIndex].title,
        type: current.movies[existingIndex].type,
        overview: current.movies[existingIndex].overview,
        tagline: current.movies[existingIndex].tagline,
        poster_url: current.movies[existingIndex].posterUrl,
        backdrop_url: current.movies[existingIndex].backdropUrl,
        release_date: current.movies[existingIndex].releaseDate,
        rating: current.movies[existingIndex].rating,
        runtime: current.movies[existingIndex].runtime,
        genres: current.movies[existingIndex].genres,
        cast_members: current.movies[existingIndex].cast,
        director: current.movies[existingIndex].director,
        trailer_key: current.movies[existingIndex].trailerKey,
        featured: current.movies[existingIndex].featured,
        trending: current.movies[existingIndex].trending,
        streams: current.movies[existingIndex].streams,
        seasons: current.movies[existingIndex].seasons,
        views: current.movies[existingIndex].views,
      });

      return current.movies[existingIndex];
    }

    current.movies.unshift(newItem);
    saveDb(current);

    syncSupabaseInsert({
      id: newItem.id,
      tmdb_id: newItem.tmdbId,
      imdb_id: newItem.imdbId,
      title: newItem.title,
      type: newItem.type,
      overview: newItem.overview,
      tagline: newItem.tagline,
      poster_url: newItem.posterUrl,
      backdrop_url: newItem.backdropUrl,
      release_date: newItem.releaseDate,
      rating: newItem.rating,
      runtime: newItem.runtime,
      genres: newItem.genres,
      cast_members: newItem.cast,
      director: newItem.director,
      trailer_key: newItem.trailerKey,
      featured: newItem.featured,
      trending: newItem.trending,
      streams: newItem.streams,
      seasons: newItem.seasons,
      views: 0,
    });

    return newItem;
  },

  update: (id: string, updates: Partial<MediaItem>): MediaItem | null => {
    const current = ensureDbExists();
    const index = current.movies.findIndex(m => m.id === id);
    if (index === -1) return null;

    current.movies[index] = {
      ...current.movies[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveDb(current);

    syncSupabaseUpdate(id, {
      featured: updates.featured,
      trending: updates.trending,
      rating: updates.rating,
      overview: updates.overview,
      streams: updates.streams,
      seasons: updates.seasons,
      updated_at: new Date().toISOString(),
    });

    return current.movies[index];
  },

  delete: (id: string): boolean => {
    const current = ensureDbExists();
    const initialLen = current.movies.length;
    current.movies = current.movies.filter(m => m.id !== id);
    if (current.movies.length !== initialLen) {
      saveDb(current);
      syncSupabaseDelete(id);
      return true;
    }
    return false;
  },

  incrementViews: (id: string): void => {
    const current = ensureDbExists();
    const item = current.movies.find(m => m.id === id || String(m.tmdbId) === id);
    if (item) {
      item.views = (item.views || 0) + 1;
      saveDb(current);
    }
  },

  getStats: () => {
    const { movies } = ensureDbExists();
    const totalMovies = movies.filter(m => m.type === 'movie').length;
    const totalTv = movies.filter(m => m.type === 'tv').length;
    const totalViews = movies.reduce((acc, m) => acc + (m.views || 0), 0);
    const totalStreams = movies.reduce((acc, m) => {
      if (m.type === 'movie') return acc + (m.streams?.length || 0);
      const epCount = m.seasons?.reduce((sAcc, s) => sAcc + s.episodes.length, 0) || 0;
      return acc + epCount;
    }, 0);

    return {
      totalItems: movies.length,
      totalMovies,
      totalTv,
      totalViews,
      totalStreams,
    };
  },

  getSettings: (): SystemSettings => {
    const { settings } = ensureDbExists();
    return settings || DEFAULT_SETTINGS;
  },

  updateSettings: (newSettings: Partial<SystemSettings>): SystemSettings => {
    const current = ensureDbExists();
    current.settings = {
      ...current.settings,
      ...newSettings,
    };
    saveDb(current);
    return current.settings;
  },

  resetDefaults: (): void => {
    const initialData: DatabaseSchema = {
      movies: INITIAL_MEDIA_SEED,
      settings: DEFAULT_SETTINGS,
    };
    saveDb(initialData);
  }
};
