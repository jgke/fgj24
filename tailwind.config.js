/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},

    fontFamily: {
      sans: ["VT323", ...defaultTheme.fontFamily.mono],
      serif: ["VT323", ...defaultTheme.fontFamily.mono],
      mono: ["VT323", ...defaultTheme.fontFamily.mono],
    },
  },
  plugins: [],
};
