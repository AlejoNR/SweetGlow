function Topbar() {
  return (
    <header className="h-16 bg-bgCard border-b border-border flex items-center justify-between px-6 shrink-0">
      <div>
        <p className="text-textMuted text-xs">
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-textDark text-sm font-semibold">Administrador</p>
          <p className="text-textMuted text-xs capitalize">Admin</p>
        </div>
      </div>
    </header>
  )
}
export default Topbar
