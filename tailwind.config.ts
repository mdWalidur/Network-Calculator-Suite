import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#070714",
        surface: "#0d0d22",
        "surface-elevated": "#141432",
        "surface-card": "rgba(18, 18, 42, 0.65)",
        brand: {
          purple: "#8b5cf6",
          indigo: "#6366f1",
          violet: "#a855f7",
          cyan: "#06b6d4",
          sky: "#38bdf8",
          gold: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "scan-line": "scanLine 8s linear infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
        "glow-purple": "0 0 40px -10px rgba(139, 92, 246, 0.45)",
        "glow-cyan": "0 0 40px -10px rgba(6, 182, 212, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;

