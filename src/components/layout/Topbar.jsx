import { useSession } from '../../context/SessionContext.jsx'

function Topbar() {
  const { usuario, logout } = useSession()
  return (
    <header className="h-16 bg-bgCard border-b border-border flex items-center justify-between px-6 shrink-0">
      <div>
        <p className="text-textMuted text-xs">
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-textDark text-sm font-semibold">{usuario?.nombre}</p>
          <p className="text-textMuted text-xs capitalize">{usuario?.rol}</p>
        </div>
        <button onClick={logout} className="text-textMuted hover:text-textDark text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-black/5 transition">
          Salir
        </button>
      </div>
    </header>
  )
}
export default Topbar
