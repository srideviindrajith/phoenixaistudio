/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090909",
        cardBg: "#121212",
        borderBg: "#262626",
        primaryOrange: "#F97316",
        accentOrange: "#FB923C",
        accentGlow: "rgba(249, 115, 22, 0.15)",
        darkGray: "#A3A3A3",
        mutedGray: "#525252",
      },
      borderRadius: {
        '3xl': '24px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(249, 115, 22, 0.1)' },
          '100%': { boxShadow: '0 0 25px rgba(249, 115, 22, 0.3)' },
        }
      }
    },
  },
  plugins: [],
}


