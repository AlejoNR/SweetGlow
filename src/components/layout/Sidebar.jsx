function Sidebar({ vista, setVista }) {

  const secciones = [
    {
      titulo: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Dashboard', icono: <i className="fa-solid fa-chart-pie"></i> },
        { id: 'inventory', label: 'Inventario', icono: <i className="fa-solid fa-box-open"></i> },
      ],
    },
    {
      titulo: 'REGISTROS Y CONTROL',
      items: [
        { id: 'historial', label: 'Compras & Ventas', icono: <i className="fa-solid fa-receipt"></i> },
        { id: 'estadisticas', label: 'Estadísticas', icono: <i className="fa-solid fa-chart-bar"></i> },
        { id: 'importar', label: 'Importar Excel', icono: <i className="fa-solid fa-file-excel"></i> },
      ],
    },
  ]

  return (
    <aside className="w-16 md:w-64 bg-sidebarBg flex flex-col py-6 shrink-0 min-h-screen border-r border-primary/20 shadow-xl shadow-primary/5 z-10">
      {/* Logo Sweet Glow */}
      <div className="px-4 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent shadow-pinkGlow flex items-center justify-center shrink-0 text-white">
          <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
        </div>
        <div className="hidden md:block">
          <span className="font-extrabold text-sidebarTxt text-lg tracking-tight font-sans">Sweet Glow</span>
          <p className="text-primary text-[10px] uppercase font-bold tracking-widest leading-tight">Cosmetics</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 flex flex-col gap-6 px-3">
        {secciones.map((sec) => (
          <div key={sec.titulo}>
            <p className="hidden md:block text-sidebarTxt/60 text-[10px] font-bold tracking-widest uppercase px-3 mb-2">
              {sec.titulo}
            </p>
            <div className="flex flex-col gap-1">
              {sec.items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => setVista(it.id)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    vista === it.id
                      ? 'bg-gradient-to-r from-primary to-primaryHover text-white shadow-lg shadow-primary/30'
                      : 'text-sidebarTxt hover:text-primary hover:bg-white/60'
                  }`}
                >
                  <span className="text-base shrink-0">{it.icono}</span>
                  <span className="hidden md:block">{it.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
export default Sidebar
