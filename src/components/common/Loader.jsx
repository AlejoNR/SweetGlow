function Loader({ texto = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-muted text-sm">{texto}</p>
    </div>
  )
}
export default Loader
