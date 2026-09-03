import type { Config } from 'tailwindcss'

/**
 * Paleta de marca Draft.
 * El amarillo es acento: se usa en CTAs, cifras y detalles, nunca como fondo
 * extendido de una pagina completa.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        negro: '#101010',
        amarillo: '#F4C500',
        'amarillo-tenue': '#FBEAB0',
        hueso: '#F7F5EF',
        grafito: '#4A4A46',
        exito: {
          DEFAULT: '#1F7A45',
          suave: '#E4F1E9',
          fuerte: '#17603D',
        },
        peligro: {
          DEFAULT: '#B3261E',
          suave: '#FBE9E7',
          fuerte: '#8F1D17',
        },
      },
      fontFamily: {
        display: ['Anton', 'Haettenschweiler', 'Impact', 'sans-serif'],
        sans: ['"Work Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        contenido: '72rem',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
} satisfies Config
