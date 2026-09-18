/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        tb: "810px",
        dk: "1320px",
      },
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
        /* ── Ordio Landing Page Tokens ── */
        hero: "#fff8f0",
        surface: {
          50: "#fdf7f3",
          100: "#f5ede4",
          200: "#efdfce",
          300: "#e8d5c4",
          400: "#dfc9b4",
        },
        line: "#e8dcd1",
        ink: {
          900: "#3a2118",
          800: "#4a2d1e",
          700: "#5a3828",
          600: "#6b4a3a",
          500: "#7d5c4c",
          400: "#9b7b6b",
          300: "#b09585",
        },
        brand: {
          DEFAULT: "#c95a32",
          dark: "#8f3f25",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        pill: "100px",
        card: "20px",
        panel: "16px",
        tile: "12px",
        device: "30px",
      },
      fontFamily: {
        display: ["Urbanist", "sans-serif"],
        body: ["Inter", "sans-serif"],
        ui: ["Instrument Sans", "sans-serif"],
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
        "marquee-left": {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(calc(-100% / var(--marquee-copies)), 0, 0)" },
        },
        "marquee-right": {
          from: { transform: "translate3d(calc(-100% / var(--marquee-copies)), 0, 0)" },
          to: { transform: "translate3d(0, 0, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
