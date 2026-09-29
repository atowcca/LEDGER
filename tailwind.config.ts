import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F7F5",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#12283D",
          soft: "#5B6472",
          faint: "#8A93A0",
        },
        border: {
          DEFAULT: "#DDE1E6",
          strong: "#C4CAD2",
        },
        accent: {
          DEFAULT: "#A6741C",
          soft: "#F3E7D2",
        },
        status: {
          matched: "#2F6B4F",
          "matched-bg": "#E7F1EB",
          mismatch: "#B0402C",
          "mismatch-bg": "#F7E9E5",
          pending: "#A6741C",
          "pending-bg": "#F3E7D2",
          review: "#3C5A80",
          "review-bg": "#E6EBF2",
        },
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-source-serif)", "Georgia", "serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "4px",
        md: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
