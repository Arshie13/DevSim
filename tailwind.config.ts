import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      fontFamily: {
        // Map the app's font utilities onto the DevSim design-system fonts
        // that are actually loaded in app.html (Chakra Petch · Exo 2 · Space
        // Mono). Orbitron/Rajdhani/Share Tech Mono were never loaded, so these
        // classes previously fell back to the system font — leaving the app's
        // typography out of sync with the landing page. Keeping the utility
        // names means no component markup has to change.
        heading: ['Chakra Petch', 'sans-serif'],
        orbitron: ['Chakra Petch', 'sans-serif'],
        rajdhani: ['Exo 2', 'sans-serif'],
        body: ['Exo 2', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        // DevSim Obsidian Terminal palette
        obsidian: {
          bg: {
            DEFAULT: '#0a0e1a',
            light: '#12192a',
          },
          surface: '#2d3446',
          border: '#27272a',
          text: {
            primary: '#d0d7dd',
            muted: '#f4f4f5',
          },
          accent: '#07a5c9',
        },
        // Design system extended palette
        cyber: {
          cyan: '#07a5c9',
          bright: '#00f5ff',
          success: '#00e5a0',
          warn: '#ffb400',
          danger: '#ff3860',
          purple: '#a855f7',
        }
      },
      borderRadius: {
        'card': '4px',
      },
      boxShadow: {
        'accent-glow': '0 0 15px rgba(7,165,201,0.30)',
        'accent-glow-lg': '0 0 30px rgba(7,165,201,0.30)',
        'accent-glow-hover': '0 0 40px rgba(7,165,201,0.40)',
        'card-glow': '0 0 20px rgba(7,165,201,0.12)',
        'card-glow-hover': '0 0 35px rgba(7,165,201,0.22)',
      },
    }
  },

  plugins: [require("@tailwindcss/typography")]
} as Config;
