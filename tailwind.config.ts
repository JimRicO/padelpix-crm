import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        stage: {
          "not-contacted": "hsl(var(--stage-not-contacted))",
          followed: "hsl(var(--stage-followed))",
          engaged: "hsl(var(--stage-engaged))",
          "dm-sent": "hsl(var(--stage-dm-sent))",
          responded: "hsl(var(--stage-responded))",
          "content-created": "hsl(var(--stage-content-created))",
          trial: "hsl(var(--stage-trial))",
          customer: "hsl(var(--stage-customer))",
          dead: "hsl(var(--stage-dead))",
        },
        priority: {
          high: "hsl(var(--priority-high))",
          medium: "hsl(var(--priority-medium))",
          low: "hsl(var(--priority-low))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        "neu-sm": "3px 3px 6px hsl(var(--shadow-dark)), -3px -3px 6px hsl(var(--shadow-light))",
        "neu": "6px 6px 12px hsl(var(--shadow-dark)), -6px -6px 12px hsl(var(--shadow-light))",
        "neu-lg": "10px 10px 20px hsl(var(--shadow-dark)), -10px -10px 20px hsl(var(--shadow-light))",
        "neu-inset": "inset 4px 4px 8px hsl(var(--shadow-dark)), inset -4px -4px 8px hsl(var(--shadow-light))",
        "neu-inset-sm": "inset 2px 2px 4px hsl(var(--shadow-dark)), inset -2px -2px 4px hsl(var(--shadow-light))",
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
        "slide-in": {
          from: { transform: "translateX(-100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "neu-pulse": {
          "0%, 100%": { 
            boxShadow: "6px 6px 12px hsl(var(--shadow-dark)), -6px -6px 12px hsl(var(--shadow-light))" 
          },
          "50%": { 
            boxShadow: "4px 4px 8px hsl(var(--shadow-dark)), -4px -4px 8px hsl(var(--shadow-light))" 
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "neu-pulse": "neu-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
