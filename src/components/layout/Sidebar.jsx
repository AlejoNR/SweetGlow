import { useSession } from '../../context/SessionContext.jsx'

function Sidebar({ vista, setVista }) {
  const { usuario } = useSession()

  const secciones = [
    {
      titulo: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Dashboard', icono: <i className="fa-solid fa-chart-line"></i> },
        { id: 'inventory', label: 'Inventario', icono: <i className="fa-solid fa-boxes-stacked"></i> },
        { id: 'lotes', label: 'Lotes', icono: <i className="fa-solid fa-layer-group"></i> },
      ],
    },
    {
      titulo: 'GESTIÓN',
      items: [
        { id: 'importar', label: 'Importar Catálogo', icono: <i className="fa-solid fa-file-import"></i> },
        { id: 'reportes', label: 'Reportes FEFO', icono: <i className="fa-solid fa-file-pdf"></i> },
      ],
    },
  ]

  if (usuario?.rol === 'admin') {
    secciones.push({
      titulo: 'ADMINISTRACIÓN',
      items: [
        { id: 'usuarios', label: 'Usuarios', icono: <i className="fa-solid fa-users"></i> },
      ],
    })
  }

  return (
    <aside className="w-16 md:w-64 bg-sidebarBg flex flex-col py-6 shrink-0 min-h-screen">
      {/* Logo */}
      <div className="px-4 mb-8 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <i className="fa-solid fa-leaf text-primary text-lg"></i>
        </div>
        <div className="hidden md:block">
          <span className="font-bold text-white text-sm tracking-wide">SIGI</span>
          <p className="text-sidebarTxt text-[10px] uppercase tracking-widest leading-tight">Gestión de Inventario</p>
        </div>
      </div>

      {/* Secciones de navegación */}
      <nav className="flex-1 flex flex-col gap-6 px-2">
        {secciones.map((sec) => (
          <div key={sec.titulo}>
            <p className="hidden md:block text-sidebarTxt/50 text-[10px] font-semibold tracking-widest uppercase px-3 mb-2">
              {sec.titulo}
            </p>
            <div className="flex flex-col gap-0.5">
              {sec.items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => setVista(it.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    vista === it.id
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'text-sidebarTxt hover:text-white hover:bg-white/8'
                  }`}
                >
                  <span className="text-lg shrink-0">{it.icono}</span>
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
