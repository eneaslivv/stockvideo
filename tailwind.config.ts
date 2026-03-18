import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0A0A0A",
          secondary: "#111111",
          card: "#1A1A1A",
          "card-hover": "#222222",
          elevated: "#2A2A2A",
        },
        accent: {
          primary: "#C8FF00",
          secondary: "#A3D900",
          glow: "rgba(200, 255, 0, 0.15)",
        },
        status: {
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444",
          info: "#3B82F6",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A1A1AA",
          tertiary: "#71717A",
          "on-accent": "#0A0A0A",
        },
        border: {
          subtle: "#2A2A2A",
          medium: "#3A3A3A",
          accent: "#C8FF00",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      fontFamily: {
        display: [
          "Cabinet Grotesk",
          "Satoshi",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        body: ["Inter", "General Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.3)",
        glow: "0 0 40px rgba(200, 255, 0, 0.15)",
        "glow-strong": "0 0 60px rgba(200, 255, 0, 0.25)",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
