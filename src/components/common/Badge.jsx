import { ColorEstado, EtiquetaEstado } from '../../core/enums/EstadoCaducidad.js'

/** Etiqueta de color segun el estado FEFO del alimento. */
function Badge({ estado }) {
  const color = ColorEstado[estado] || '#52B788'
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}55` }}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {EtiquetaEstado[estado] || estado}
    </span>
  )
}
export default Badge
