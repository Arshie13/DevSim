import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      fontFamily: {
        // Map the app's font utilities onto the DevSim design-system fonts
        // loaded in app.html (Inter · JetBrains Mono). Keeping the utility
        // names means no component markup has to change.
        heading: ['Inter', 'system-ui', 'sans-serif'],
        orbitron: ['Inter', 'system-ui', 'sans-serif'],
        rajdhani: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // DevSim Obsidian Terminal palette (CSS-var backed for theming)
        obsidian: {
          bg: {
            DEFAULT: 'rgb(var(--bg-rgb) / <alpha-value>)',
            light: 'rgb(var(--bg-light-rgb) / <alpha-value>)',
          },
          surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
          border: 'rgb(var(--border-rgb) / <alpha-value>)',
          text: {
            primary: 'rgb(var(--text-primary-rgb) / <alpha-value>)',
            muted: 'rgb(var(--text-muted-rgb) / <alpha-value>)',
          },
          accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        },
        // Design system extended palette
        cyber: {
          cyan: 'rgb(var(--accent-rgb) / <alpha-value>)',
          bright: 'rgb(var(--cyan-bright-rgb) / <alpha-value>)',
          success: 'rgb(var(--success-rgb) / <alpha-value>)',
          warn: 'rgb(var(--warn-rgb) / <alpha-value>)',
          danger: 'rgb(var(--danger-rgb) / <alpha-value>)',
          purple: 'rgb(var(--purple-rgb) / <alpha-value>)',
        }
      },
      borderRadius: {
        'card': '4px',
      },
      boxShadow: {
        'accent-glow': '0 0 15px rgba(7,165,201,0.10)',
        'accent-glow-lg': '0 0 30px rgba(7,165,201,0.12)',
        'accent-glow-hover': '0 0 40px rgba(7,165,201,0.16)',
        'card-glow': '0 0 20px rgba(7,165,201,0.06)',
        'card-glow-hover': '0 0 35px rgba(7,165,201,0.10)',
      },
    }
  },

  plugins: [require("@tailwindcss/typography")]
} as Config;
