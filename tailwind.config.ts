import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FDF8F2',   // background halaman customer
          100: '#F5E6D0',   // hover ringan
          200: '#E8C99A',   // border aksen
          500: '#C27C3A',   // warna utama (tombol primer, aksen)
          600: '#A8612A',   // hover tombol primer
          700: '#8B4E1F',   // active / pressed
          900: '#3D1F0A',   // teks gelap di atas background terang
        },
        surface: {
          white:  '#FFFFFF',
          soft:   '#FAFAF9',   // background halaman kasir/admin
          muted:  '#F3F2F0',   // background card secondary
          border: '#E5E3DF',   // semua border default
        },
        ink: {
          primary:   '#1A1A1A',   // teks utama
          secondary: '#6B6560',   // teks sekunder / label
          muted:     '#9E9891',   // placeholder, hint
          inverse:   '#FFFFFF',   // teks di atas background gelap
        },
        status: {
          baru:     { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
          diproses: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
          selesai:  { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
          habis:    { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: '0.75rem', // Sesuai standard xl Tailwind (12px)
        '2xl': '1rem', // Untuk modal
      }
    },
  },
  plugins: [],
};
export default config;
