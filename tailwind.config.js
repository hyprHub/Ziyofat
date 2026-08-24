/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        espresso: '#3C2A21',
        latte: '#E5C3A6',
        terracotta: '#D05A3F',
        'warm-white': '#FFFDF9',
        'soft-sand': '#EFE7DE',
        taupe: '#A89A8C',
        'deep-brown': '#291D18',
        sage: '#7D8A6A',
        'muted-gold': '#C59B5B',
        success: '#5E8063',
        danger: '#B84C3A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      borderRadius: {
        'button': '10px',
        'card': '16px',
        'dialog': '20px',
      },
    },
  },
  plugins: [],
}
