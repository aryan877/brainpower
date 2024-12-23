import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import scrollbar from "tailwind-scrollbar";

export default {
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
      },
      typography: {
        DEFAULT: {
          css: {
            color: "var(--text-primary)",
            a: {
              color: "var(--primary)",
              "&:hover": {
                color: "var(--primary-hover)",
              },
            },
            code: {
              color: "var(--text-primary)",
              background: "rgba(255, 255, 255, 0.1)",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.25rem",
              fontWeight: "500",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
          },
        },
      },
      keyframes: {
        "modal-enter": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "modal-enter": "modal-enter 0.2s ease-out",
      },
    },
  },
  plugins: [typography, scrollbar],
} satisfies Config;
