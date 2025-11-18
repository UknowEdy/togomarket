/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#228B22', // Vert du drapeau togolais
          light: '#32CD32',
          dark: '#006400',
        },
        secondary: {
          DEFAULT: '#FFD700', // Jaune/Or
          light: '#FFED4E',
          dark: '#FFC300',
        },
        danger: {
          DEFAULT: '#DC143C',
          light: '#FF6B6B',
          dark: '#B22222',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
