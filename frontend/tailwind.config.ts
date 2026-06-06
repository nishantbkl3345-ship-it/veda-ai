import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A1A1A",
        accent: "#F97316",
        "card-bg": "#ffffff",
        "card-border": "#e5e5e5",
        muted: "#888888",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-from-top-1": {
          from: { transform: "translateY(-4px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-in-from-top-1": "slide-in-from-top-1 150ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
