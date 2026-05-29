import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        varta: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#064e3b'
        },
        chat: {
          wall: '#efeae2',
          incoming: '#ffffff',
          outgoing: '#dcf8c6'
        }
      },
      boxShadow: {
        soft: '0 20px 45px -30px rgba(15, 23, 42, 0.45)'
      },
      backgroundImage: {
        'chat-pattern': 'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.08) 1px, transparent 0)'
      }
    }
  },
  plugins: []
};

export default config;
