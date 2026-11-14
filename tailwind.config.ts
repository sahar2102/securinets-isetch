import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", sm: "2rem", lg: "2.5rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        canvas: "rgb(var(--bg) / <alpha-value>)",
        soft: "rgb(var(--bg-soft) / <alpha-value>)",
        elev: "rgb(var(--bg-elev) / <alpha-value>)",
        ink: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--text-muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        crimson: {
          DEFAULT: "#B3001B",
          deep: "#8B0000",
          ink: "#4A0009",
          400: "#FF5A66",
          500: "#FF2D3D",
        },
        ember: "rgb(var(--accent) / <alpha-value>)",
        jade: "#2FBF8F",
        amber: "#F5A524",
        violet: "#A78BFA",
        sky: "#38BDF8",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      opacity: {
        3: "0.03",
        4: "0.04",
        6: "0.06",
        8: "0.08",
        12: "0.12",
        15: "0.15",
        18: "0.18",
        22: "0.22",
      },
      fontSize: {
        "display-sm": ["clamp(2.4rem,6vw,3.5rem)", { lineHeight: "1.02", letterSpacing: "-0.035em" }],
        "display-md": ["clamp(3rem,8vw,5rem)", { lineHeight: "0.98", letterSpacing: "-0.04em" }],
        "display-lg": ["clamp(3.4rem,10vw,7rem)", { lineHeight: "0.92", letterSpacing: "-0.045em" }],
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(255 45 61 / 0.22), 0 18px 60px -18px rgb(179 0 27 / 0.55)",
        "glow-sm": "0 0 24px -6px rgb(255 45 61 / 0.45)",
        card: "0 24px 60px -30px rgb(0 0 0 / 0.85)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at center, rgb(var(--bg) / 0) 0%, rgb(var(--bg) / 0.9) 70%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(600%)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.6" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        caret: { "0%,49%": { opacity: "1" }, "50%,100%": { opacity: "0" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 7s ease-in-out infinite",
        scan: "scan 6s linear infinite",
        marquee: "marquee 32s linear infinite",
        "pulse-ring": "pulse-ring 3.2s cubic-bezier(0.22,1,0.36,1) infinite",
        shimmer: "shimmer 2.6s linear infinite",
        caret: "caret 1.05s step-end infinite",
        "spin-slow": "spin-slow 26s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
