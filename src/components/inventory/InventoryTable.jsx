import { MotorFEFO } from '../../core/services/MotorFEFO.js'

function getCategoryIcon(cat) {
  switch (cat.toLowerCase()) {
    case 'carnico': return 'fa-drumstick-bite';
    case 'lacteo': return 'fa-cheese';
    case 'vegetal': return 'fa-apple-whole';
    case 'seco': return 'fa-wheat-awn';
    case 'preparado': return 'fa-utensils';
    default: return 'fa-box';
  }
}

function getStatusBadge(estado) {
  const styles = {
    critico: 'text-red-600 bg-red-50',
    urgente: 'text-orange-500 bg-orange-50',
    preventivo: 'text-amber-500 bg-amber-50',
    fresco: 'text-emerald-600 bg-emerald-50'
  }
  const colorPoint = {
    critico: 'bg-red-500',
    urgente: 'bg-orange-400',
    preventivo: 'bg-amber-400',
    fresco: 'bg-emerald-500'
  }
  const labels = {
    critico: 'Crítico',
    urgente: 'Urgente',
    preventivo: 'Preventivo',
    fresco: 'Sin alerta'
  }
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${styles[estado] || styles.fresco}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colorPoint[estado] || colorPoint.fresco}`}></span>
      {labels[estado] || labels.fresco}
    </span>
  )
}

function formatDays(horas) {
  if (horas <= 0) return <span className="text-red-600 font-bold text-xs">Vencido</span>
  const dias = Math.floor(horas / 24)
  if (dias === 0) return <span className="text-red-600 font-bold text-xs">Hoy</span>
  if (dias <= 2) return <span className="text-red-600 font-bold text-xs">{dias} {dias === 1 ? 'día' : 'días'}</span>
  if (dias <= 7) return <span className="text-amber-600 font-bold text-xs">{dias} días</span>
  return <span className="text-emerald-700 font-bold text-xs">{dias} días</span>
}

function formatDateShort(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function InventoryTable({ alimentos, onEliminar, onEditar }) {
  if (alimentos.length === 0) {
    return <p className="text-textMuted text-sm py-8 text-center bg-white">No se encontraron productos.</p>
  }

  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full text-sm text-left">
        <thead className="bg-white border-b border-gray-100">
          <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            <th className="py-4 px-4 font-bold text-center">FEFO #</th>
            <th className="py-4 px-4 font-bold">Alimento</th>
            <th className="py-4 px-4 font-bold">Categoría</th>
            <th className="py-4 px-4 font-bold">Cantidad</th>
            <th className="py-4 px-4 font-bold">Vence</th>
            <th className="py-4 px-4 font-bold">Días Restantes</th>
            <th className="py-4 px-4 font-bold">Estado</th>
            <th className="py-4 px-4 font-bold text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alimentos.map((a, index) => {
            const horas = Math.round(a.horasParaCaducar())
            const isCritico = a.estadoCaducidad() === 'critico'
            const isUrgente = a.estadoCaducidad() === 'urgente'
            
            let bgIndex = 'bg-emerald-500'
            if (isCritico) bgIndex = 'bg-emerald-500' // Matches the image where numbers are green/yellow/orange
            if (index === 3 || index === 4) bgIndex = 'bg-amber-400'
            if (index > 4) bgIndex = 'bg-gray-200 text-gray-500'

            return (
              <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-white text-xs font-bold ${
                    a.estadoCaducidad() === 'critico' ? 'bg-emerald-500' :
                    a.estadoCaducidad() === 'urgente' ? 'bg-amber-400' :
                    a.estadoCaducidad() === 'preventivo' ? 'bg-amber-300 text-amber-900' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <p className="font-bold text-gray-800">{a.nombre}</p>
                  {a.lote && <p className="text-[10px] text-gray-400 font-medium">Lote #{a.lote}</p>}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100/80 text-gray-500 text-xs font-medium">
                    <i className={`fa-solid ${getCategoryIcon(a.categoria)} text-[10px]`}></i>
                    <span className="capitalize">{a.categoria}</span>
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-gray-600">
                  {a.cantidad} <span className="text-gray-400 text-xs">{a.unidad}</span>
                </td>
                <td className="py-3 px-4 font-medium text-gray-500 font-mono text-xs">
                  {formatDateShort(a.fechaCaducidad)}
                </td>
                <td className="py-3 px-4">
                  {formatDays(horas)}
                </td>
                <td className="py-3 px-4">
                  {getStatusBadge(a.estadoCaducidad())}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onEditar(a)} 
                      className="w-7 h-7 rounded flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Actualizar Alimento"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>

                    <button 
                      onClick={() => onEliminar(a.id)} 
                      className="w-7 h-7 rounded flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                      title="Eliminar Alimento"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
export default InventoryTable
