import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
    "./src/layouts/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      },
      colors: {
        brand: {
          DEFAULT: "#2BA84A",
          foreground: "#ffffff",
          muted: "#EBF8EC",
          dark: "#1C6C31"
        }
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;

