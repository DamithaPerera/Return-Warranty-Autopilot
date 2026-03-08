import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f7ff",
          100: "#e5efff",
          500: "#2563eb",
          700: "#1d4ed8"
        }
      }
    }
  },
  plugins: []
};

export default config;
