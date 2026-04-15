/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFB800",
          black: "#000000",
          dark: "#121212",
          "dark-light": "#1A1A1A",
          gray: "#A1A1AA",
          silver: "#E5E5E5",
        },
        background: "#000000",
        surface: "#121212",
        "surface-light": "#1A1A1A",
        border: "#2A2A2A",
        "text-primary": "#FFFFFF",
        "text-secondary": "#A1A1AA",
        "text-muted": "#71717A",
        "tg-bg": "var(--tg-theme-bg-color)",
        "tg-text": "var(--tg-theme-text-color)",
        "tg-button": "var(--tg-theme-button-color)",
        "tg-button-text": "var(--tg-theme-button-text-color)",
        "tg-secondary": "var(--tg-theme-secondary-bg-color)",
        "tg-hint": "var(--tg-theme-hint-color)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};