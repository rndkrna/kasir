import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Flattened structure for better reliability in production builds
        'brand-50': '#FDF8F2',
        'brand-100': '#F5E6D0',
        'brand-200': '#E8C99A',
        'brand-500': '#C27C3A',
        'brand-600': '#A8612A',
        'brand-700': '#8B4E1F',
        'brand-900': '#3D1F0A',
        
        'surface-white': '#FFFFFF',
        'surface-soft': '#FAFAF9',
        'surface-muted': '#F3F2F0',
        'surface-border': '#E5E3DF',
        
        'ink-primary': '#1A1A1A',
        'ink-secondary': '#6B6560',
        'ink-muted': '#9E9891',
        'ink-inverse': '#FFFFFF',
        
        'status-baru-bg': '#EFF6FF',
        'status-baru-text': '#1D4ED8',
        'status-baru-border': '#BFDBFE',
        
        'status-diproses-bg': '#FFFBEB',
        'status-diproses-text': '#92400E',
        'status-diproses-border': '#FDE68A',
        
        'status-selesai-bg': '#F0FDF4',
        'status-selesai-text': '#166534',
        'status-selesai-border': '#BBF7D0',
        
        'status-habis-bg': '#FEF2F2',
        'status-habis-text': '#991B1B',
        'status-habis-border': '#FECACA',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
};
export default config;
