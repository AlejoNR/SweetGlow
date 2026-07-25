/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Tema Claro Sweet Glow (Rosados y Pasteles) ── */
        bg:         '#FFF5F8', // Fondo rosa pastel muy suave y limpio
        bgCard:     '#FFFFFF',
        textDark:   '#2D0C1E', // Vino/Ciruela profundo elegante para lectura
        textMuted:  '#9D6B84', // Rosa sepia/púrpura tenue
        border:     '#FCE7F3', // Borde rosa pastel (pink-100)
        inputBg:    '#FFF0F5', // Lavender blush

        /* ── Sidebar Chic Rosado Pastel ── */
        sidebarBg:  '#FCE7F3', // Rosa pastel claro
        sidebarHov: '#FBCFE8', // Rosa un poco más oscuro al pasar el cursor
        sidebarTxt: '#831843', // Texto rosa oscuro / magenta para contraste

        /* ── Acentos Sweet Glow ── */
        primary:    '#EC4899', // Rosa vibrante icónico (pink-500)
        primaryHover: '#DB2777', // (pink-600)
        primaryLt:  '#FCE7F3', // Rosa pastel
        accent:     '#F43F5E', // Rose-500
        gold:       '#F59E0B',

        /* ── Aliases legacy ── */
        panel:      '#2D0C1E',
        input:      '#3B0E2A',
        text:       '#FDF2F8',
        muted:      '#FBCFE8',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(236, 72, 153, 0.08), 0 2px 6px -1px rgba(0,0,0,0.02)',
        cardHover: '0 10px 25px -3px rgba(236, 72, 153, 0.15)',
        pinkGlow: '0 0 20px rgba(236, 72, 153, 0.35)',
      },
    },
  },
  plugins: [],
}
