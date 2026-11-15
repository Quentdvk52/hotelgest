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
          50: "#f0f7f2",
          100: "#dceee1",
          200: "#bcdec6",
          300: "#90c7a1",
          400: "#5ea976",
          500: "#398c54",
          600: "#297141",
          700: "#184f28", // Dominant logo forest green
          800: "#133f20",
          900: "#0e3019",
          950: "#071a0d",
        },
        wine: {
          50: "#fdf2f4",
          100: "#fcebee",
          200: "#f9ccd4",
          300: "#f39eab",
          400: "#e9687e",
          500: "#d93855",
          600: "#c0213f",
          700: "#8c101c", // Logo ruby wine red
          800: "#750e18",
          900: "#5e0c14",
          950: "#38040a",
        },
        gold: {
          50: "#fdfbf5",
          100: "#fbf6e7",
          200: "#f6ebc9",
          300: "#eedaa0",
          400: "#e4c26e",
          500: "#d4af37", // Warm luxury gold
          600: "#be9629",
          700: "#98721e",
          800: "#7c5a1c",
          900: "#67491b",
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
