/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Tema claro (contenido principal) ── */
        bg:         '#F5F7FA',
        bgCard:     '#FFFFFF',
        textDark:   '#1A2332',
        textMuted:  '#64748B',
        border:     '#E2E8F0',
        inputBg:    '#F8FAFC',

        /* ── Sidebar verde oscuro ── */
        sidebarBg:  '#0F2A1D',
        sidebarHov: '#163D2B',
        sidebarTxt: '#94D2B0',

        /* ── Acentos ── */
        primary:    '#2D9F6F',
        primaryLt:  '#E8F5EF',

        /* ── Estados FEFO ── */
        critico:    '#E63946',
        urgente:    '#F4A261',
        preventivo: '#E9C46A',
        fresco:     '#52B788',

        /* ── Legacy aliases (login dark screen) ── */
        panel:      '#122B22',
        input:      '#1A3A2E',
        text:       '#E8F1ED',
        muted:      '#8AA69B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        cardHover: '0 4px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
