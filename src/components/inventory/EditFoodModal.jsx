import { useState, useEffect } from 'react'
import { AlimentoFactory } from '../../core/factories/AlimentoFactory.js'

function EditFoodModal({ alimento, onActualizar, onCerrar }) {
  const [categoria, setCategoria] = useState(alimento.categoria || 'carnico')
  
  // Format date for datetime-local input
  const formatDateTime = (isoString) => {
    if (!isoString) return ''
    const d = new Date(isoString)
    // Adjust for local time zone
    const tzoffset = d.getTimezoneOffset() * 60000
    const localISOTime = (new Date(d - tzoffset)).toISOString().slice(0, -1)
    return localISOTime.substring(0, 16)
  }

  const [datos, setDatos] = useState({
    id: alimento.id,
    nombre: alimento.nombre || '',
    cantidad: alimento.cantidad || '',
    unidad: alimento.unidad || 'kg',
    fechaCaducidad: formatDateTime(alimento.fechaCaducidad),
    lote: alimento.lote || '',
    humedad: alimento.humedad || '',
    humedadMaxima: alimento.humedadMaxima || '14',
    temperaturaConservacion: alimento.temperaturaConservacion || '-18',
    fechaIngreso: alimento.fechaIngreso
  })
  const [error, setError] = useState('')

  const set = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))

  const handleGuardar = () => {
    setError('')
    try {
      const alimentoActualizado = AlimentoFactory.crearAlimento(categoria, {
        ...datos,
        fechaCaducidad: datos.fechaCaducidad ? new Date(datos.fechaCaducidad).toISOString() : null,
      })
      onActualizar(alimentoActualizado)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-textDark text-lg">Actualizar alimento (RF-07)</h3>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>
        
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-critico/10 border border-critico/20 text-critico text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-textMuted text-xs font-semibold uppercase tracking-wide mb-1">Categoría</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-gray-50 text-gray-500 cursor-not-allowed" disabled>
                <option value={categoria}>{categoria}</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-1">La categoría no se puede cambiar al editar.</p>
            </div>

            <div>
               <label className="block text-textMuted text-xs font-semibold uppercase tracking-wide mb-1">Nombre del Producto</label>
               <input className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm" placeholder="Ej: Manzanas" value={datos.nombre} onChange={(e) => set('nombre', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-textMuted text-xs font-semibold uppercase tracking-wide mb-1">Cantidad</label>
                 <input className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm" type="number" placeholder="Ej: 10" value={datos.cantidad} onChange={(e) => set('cantidad', e.target.value)} />
              </div>
              <div>
                 <label className="block text-textMuted text-xs font-semibold uppercase tracking-wide mb-1">Unidad</label>
                 <input className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm" placeholder="kg, L, und" value={datos.unidad} onChange={(e) => set('unidad', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-textMuted text-xs font-semibold uppercase tracking-wide mb-1">Fecha de caducidad</label>
              <input className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm" type="datetime-local" value={datos.fechaCaducidad} onChange={(e) => set('fechaCaducidad', e.target.value)} />
            </div>

            <div>
               <label className="block text-textMuted text-xs font-semibold uppercase tracking-wide mb-1">Lote</label>
               <input className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm" placeholder="Ej: LOTE-123" value={datos.lote} onChange={(e) => set('lote', e.target.value)} />
            </div>

            {categoria === 'seco' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-textMuted text-xs font-semibold uppercase tracking-wide mb-1">Humedad %</label>
                   <input className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm" type="number" placeholder="Ej: 12" value={datos.humedad} onChange={(e) => set('humedad', e.target.value)} />
                </div>
                <div>
                   <label className="block text-textMuted text-xs font-semibold uppercase tracking-wide mb-1">Humedad máx %</label>
                   <input className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm" type="number" placeholder="Ej: 14" value={datos.humedadMaxima} onChange={(e) => set('humedadMaxima', e.target.value)} />
                </div>
              </div>
            )}

            {categoria === 'carnico' && (
               <div>
                 <label className="block text-textMuted text-xs font-semibold uppercase tracking-wide mb-1">Temp. conservación °C</label>
                 <input className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm" type="number" placeholder="Ej: -18" value={datos.temperaturaConservacion} onChange={(e) => set('temperaturaConservacion', e.target.value)} />
               </div>
            )}
          </div>

          <div className="pt-5 mt-6 border-t border-gray-100 flex justify-end gap-3">
            <button onClick={onCerrar} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleGuardar} className="btn-primary">Actualizar Alimento</button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default EditFoodModal
