/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFBF7",
          100: "#FBF7F0",
          200: "#F4EADB",
        },
        terracotta: {
          50: "#FBEEE8",
          100: "#F3D6C7",
          400: "#CF8368",
          500: "#B5654D",
          600: "#9C5240",
          700: "#7E4133",
        },
        sage: {
          100: "#E6ECE3",
          400: "#9CB19A",
          500: "#7A9377",
          600: "#5F7A5D",
        },
        plum: {
          500: "#6E4555",
          600: "#5A3746",
        },
        ink: {
          700: "#463F3A",
          800: "#33302E",
          900: "#211F1D",
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        display: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(70, 63, 58, 0.25)",
        card: "0 4px 20px -8px rgba(70, 63, 58, 0.20)",
      },
    },
  },
  plugins: [],
};
