import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      fontFamily: {
        mplus: ["var(--font-mplus)"],
        mono: ["var(--font-geist-mono)"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#333",
            a: {
              color: "#3182ce",
              "&:hover": {
                color: "#2c5282",
              },
            },
          },
        },
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)" },
          "100%": { transform: "translateY(0)" },
        },
        discover: {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
            filter: "blur(2px)",
          },
          "50%": {
            opacity: "1",
            transform: "translateY(0)",
            filter: "blur(0px)",
          },
          "75%": {
            filter: "brightness(1.1)",
          },
          "100%": {
            filter: "brightness(1)",
          },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-out",
        slideUp: "slideUp 0.6s ease-out",
        fadeInUp:
          "fadeIn 0.6s ease-out forwards, slideUp 0.6s ease-out forwards",
        discover: "discover 3s ease-in-out",
      },
    },
  },
  plugins: [typography],
};

export default config;
