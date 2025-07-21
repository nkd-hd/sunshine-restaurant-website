import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom restaurant theme colors
        "wooden-brown": {
          DEFAULT: "#4E342E",
          50: "#fef7f6",
          100: "#fceeec",
          200: "#f7dbd6",
          300: "#f0bdb4",
          400: "#e69388",
          500: "#d76a5e",
          600: "#c24c3e",
          700: "#a23c30",
          800: "#85342b",
          900: "#4E342E",
          950: "#3d1a17",
        },
        "leafy-green": {
          DEFAULT: "#1B4332",
          dark: "#1B4332",
          50: "#f3f9f4",
          100: "#e4f2e6",
          200: "#cae5cd",
          300: "#a0d1a6",
          400: "#6db574",
          500: "#4a9b50",
          600: "#388140",
          700: "#2e7d32",
          800: "#28562b",
          900: "#1B4332",
          950: "#0f2512",
        },
        // Additional restaurant-friendly colors
        "warm-orange": {
          DEFAULT: "#ff8a50",
          50: "#fff7ed",
          100: "#ffecd4",
          200: "#ffd4a9",
          300: "#ffb572",
          400: "#ff8a50",
          500: "#fe5f1e",
          600: "#ef4411",
          700: "#c63411",
          800: "#9d2c17",
          900: "#7e2817",
        },
        "golden-yellow": {
          DEFAULT: "#F4D35E",
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#F4D35E",
          500: "#F4D35E",
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(-5%)" },
          "50%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "bounce-gentle": "bounce-gentle 2s infinite",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Inter", "ui-sans-serif", "system-ui"],
      },
      fontSize: {
        "display-2xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-xl": ["3.75rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "display-md": ["2.25rem", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
      },
      boxShadow: {
        "food-card": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "food-card-hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "menu-item": "0 2px 8px rgba(0, 0, 0, 0.08)",
        "floating": "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      backdropBlur: {
        xs: "2px",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      screens: {
        "xs": "475px",
        "3xl": "1920px",
      },
      aspectRatio: {
        "4/3": "4 / 3",
        "3/2": "3 / 2",
        "5/4": "5 / 4",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
