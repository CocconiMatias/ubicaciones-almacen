import type { Config } from "tailwindcss";

// ------------------------------------------------------------------
// Tokens de diseño — herramienta operativa de depósito, no marketing.
// Los colores de ocupación (libre/medio/lleno) están reservados para
// ESE uso exclusivamente: no se reutilizan como acento en botones,
// links ni nada decorativo, para que el operario los lea de un vistazo
// sin ambigüedad.
// ------------------------------------------------------------------
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#F1F3F6",       // gris frío claro, no blanco puro
          surface: "#FFFFFF",
          border: "#D8DEE6",
        },
        navy: {
          900: "#0B2545",      // navegación / chrome
          700: "#13345E",
          500: "#1D4A7A",
        },
        accent: {
          DEFAULT: "#0EA5B7",  // acciones interactivas (nunca ocupación)
          hover: "#0C8A99",
        },
        ocupacion: {
          libre: "#22C55E",
          media: "#F59E0B",
          alta: "#F97316",
          llena: "#EF4444",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
