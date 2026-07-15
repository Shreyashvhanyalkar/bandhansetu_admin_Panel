export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Rubik", "sans-serif"],
        rubik: ["Rubik", "sans-serif"],
      },
      colors: {
        brand: {
          700: "#8B0000",
          800: "#6b0000",
          900: "#4a0000",
        },
      },
    },
  },
  plugins: [],
};