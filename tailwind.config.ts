import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#ff2a3b', // Exact bright red from screenshot
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        surface: {
          app: '#e8ecf4',
          card: '#ffffff',
          darkCard: '#13151b',
          pill: '#f1f4f9',
          border: '#e2e8f0',
        },
        cinemaDark: {
          950: '#0c0e14',
          900: '#141721',
          800: '#1c202e',
          700: '#282e42',
        }
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'app': '0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 1px 1px rgba(0,0,0,0.03)',
        'hero': '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        'dock': '0 15px 35px -5px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
};
export default config;
