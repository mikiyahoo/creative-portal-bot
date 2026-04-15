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
        primary: "#E91E63",
        "primary-dark": "#C2185B",
        "primary-light": "#F8BBD9",
        background: "#F8F9FA",
        surface: "#FFFFFF",
        border: "#E5E7EB",
        "text-primary": "#000000",
        "text-secondary": "#6B7280",
        "text-muted": "#9CA3AF",
        "tg-bg": "var(--tg-theme-bg-color)",
        "tg-text": "var(--tg-theme-text-color)",
        "tg-button": "var(--tg-theme-button-color)",
        "tg-button-text": "var(--tg-theme-button-text-color)",
        "tg-secondary": "var(--tg-theme-secondary-bg-color)",
        "tg-hint": "var(--tg-theme-hint-color)",
      },
      borderRadius: {
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};