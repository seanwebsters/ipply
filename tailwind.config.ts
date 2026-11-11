import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0B0B0F", soft: "#1A1A22", muted: "#5B5B66", faint: "#8E8E99" },
        paper: { DEFAULT: "#FBFAF8", warm: "#F5F2EE", line: "#E9E6E1" },
        iris: {
          lavender: "#C9B8FF",
          blue: "#B8D4FF",
          pink: "#FFD1E3",
          peach: "#FFD8B8",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      letterSpacing: { tightest: "-0.045em" },
      maxWidth: { site: "88rem" },
      borderRadius: { "4xl": "2rem" },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } },
        drift: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(2%, -3%, 0) scale(1.06)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        drift: "drift 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
