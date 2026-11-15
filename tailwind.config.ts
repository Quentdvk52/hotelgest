import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        vignoble: {
          50: "#faf5f5",
          100: "#f5e8e8",
          200: "#edd5d6",
          300: "#deb5b8",
          400: "#c78b91",
          500: "#af646d",
          600: "#964c57",
          700: "#7c3c46",
          800: "#68353d",
          900: "#582f36",
          950: "#32161b",
        },
        gold: {
          50: "#fdfbf5",
          100: "#fbf6e7",
          200: "#f6ebc9",
          300: "#eedaa0",
          400: "#e4c26e",
          500: "#d9a844",
          600: "#be8933",
          700: "#97652a",
          800: "#7c5127",
          900: "#684224",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-geist-serif)", "ui-serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
