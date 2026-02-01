import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: { colors: {
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
        }
      }}
  },

  plugins: [require("@tailwindcss/typography")]
} as Config;
