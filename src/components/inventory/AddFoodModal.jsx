import { useState } from 'react'
import { AlimentoFactory } from '../../core/factories/AlimentoFactory.js'

/**
 * Formulario para agregar un alimento. React solo recoge datos y delega
 * la CREACION y VALIDACION al AlimentoFactory (Factory Method del /core).
 */
function AddFoodModal({ onAgregar, onCerrar }) {
  const [categoria, setCategoria] = useState('carnico')
  const [datos, setDatos] = useState({
    nombre: '', cantidad: '', unidad: 'kg', fechaCaducidad: '', lote: '',
    humedad: '', humedadMaxima: '14', temperaturaConservacion: '-18',
  })
  const [error, setError] = useState('')

  const getPrefix = (cat) => {
    switch (cat) {
      case 'carnico': return 'CAR-'
      case 'lacteo': return 'LAC-'
      case 'vegetal': return 'VEG-'
      case 'seco': return 'SEC-'
      default: return 'LOT-'
    }
  }

  const set = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))

  const handleGuardar = () => {
    setError('')
    try {
      // El Factory crea la subclase correcta y aplica sus validaciones
      const alimento = AlimentoFactory.crearAlimento(categoria, {
        ...datos,
        lote: `${getPrefix(categoria)}${datos.lote || ''}`,
        fechaCaducidad: datos.fechaCaducidad ? new Date(datos.fechaCaducidad).toISOString() : null,
      })
      onAgregar(alimento)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-sidebarBg/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-textDark text-lg font-semibold mb-4">Agregar alimento</h3>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-critico/10 border border-critico/20 text-critico text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Categoría</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="input-light">
              {AlimentoFactory.categoriasDisponibles().map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
             <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Nombre del Producto</label>
             <input className="input-light" placeholder="Ej: Manzanas" value={datos.nombre} onChange={(e) => set('nombre', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Cantidad</label>
               <input className="input-light" type="number" placeholder="Ej: 10" value={datos.cantidad} onChange={(e) => set('cantidad', e.target.value)} />
            </div>
            <div>
               <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Unidad</label>
               <select className="input-light" value={datos.unidad} onChange={(e) => set('unidad', e.target.value)}>
                 <option value="kg">Kilogramos (kg)</option>
                 <option value="g">Gramos (g)</option>
                 <option value="L">Litros (L)</option>
                 <option value="ml">Mililitros (ml)</option>
                 <option value="und">Unidades (und)</option>
               </select>
            </div>
          </div>

          <div>
            <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Fecha de caducidad</label>
            <input className="input-light" type="datetime-local" value={datos.fechaCaducidad} onChange={(e) => set('fechaCaducidad', e.target.value)} />
          </div>

          <div>
             <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Lote</label>
             <div className="flex">
               <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-inputBg text-textMuted text-sm font-semibold">
                 {getPrefix(categoria)}
               </span>
               <input className="input-light rounded-l-none uppercase" placeholder="Ej: 123" value={datos.lote} onChange={(e) => set('lote', e.target.value.toUpperCase())} />
             </div>
          </div>

          {categoria === 'seco' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Humedad %</label>
                 <input className="input-light" type="number" placeholder="Ej: 12" value={datos.humedad} onChange={(e) => set('humedad', e.target.value)} />
              </div>
              <div>
                 <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Humedad máx %</label>
                 <input className="input-light" type="number" placeholder="Ej: 14" value={datos.humedadMaxima} onChange={(e) => set('humedadMaxima', e.target.value)} />
              </div>
            </div>
          )}

          {categoria === 'carnico' && (
             <div>
               <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Temp. conservación °C</label>
               <input className="input-light" type="number" placeholder="Ej: -18" value={datos.temperaturaConservacion} onChange={(e) => set('temperaturaConservacion', e.target.value)} />
             </div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onCerrar} className="btn-ghost flex-1 border border-border">Cancelar</button>
          <button onClick={handleGuardar} className="btn-primary flex-1">Guardar Alimento</button>
        </div>
      </div>
    </div>
  )
}
export default AddFoodModal
