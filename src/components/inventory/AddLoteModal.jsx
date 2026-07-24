import { useState } from 'react'
import { AlimentoFactory } from '../../core/factories/AlimentoFactory.js'

/**
 * RF-09: Registrar entrada de lote.
 * Permite registrar un nuevo lote de un alimento EXISTENTE.
 * Solo pide: código de lote, cantidad y fecha de vencimiento.
 * Los datos base (nombre, categoría, unidad, etc.) se heredan del alimento original.
 *
 * Excepción RF-09: Si la fecha de caducidad es inválida o anterior a la actual,
 * el sistema muestra el error.
 */
function AddLoteModal({ alimento, onAgregarLote, onCerrar }) {
  const [lote, setLote] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [fechaCaducidad, setFechaCaducidad] = useState('')
  const [error, setError] = useState('')

  const handleGuardar = () => {
    setError('')

    // --- Validaciones del lote ---
    if (!lote.trim()) {
      setError('El código de lote es obligatorio.')
      return
    }

    if (!cantidad || Number(cantidad) <= 0) {
      setError('La cantidad debe ser un número positivo.')
      return
    }

    if (!fechaCaducidad) {
      setError('La fecha de vencimiento es obligatoria.')
      return
    }

    // Excepción RF-09: fecha anterior a la actual
    const fechaSeleccionada = new Date(fechaCaducidad)
    if (fechaSeleccionada <= new Date()) {
      setError('La fecha de caducidad no puede ser anterior o igual a la fecha actual.')
      return
    }

    try {
      // Crear nuevo registro con los datos base del alimento original + datos del nuevo lote
      const nuevoRegistro = AlimentoFactory.crearAlimento(alimento.categoria, {
        nombre: alimento.nombre,
        cantidad: Number(cantidad),
        unidad: alimento.unidad,
        fechaCaducidad: fechaSeleccionada.toISOString(),
        lote: lote.trim(),
        // Propiedades específicas de subclases (se heredan del original)
        humedad: alimento.humedad,
        humedadMaxima: alimento.humedadMaxima,
        temperaturaConservacion: alimento.temperaturaConservacion,
      })
      onAgregarLote(nuevoRegistro)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-textDark text-lg">Registrar entrada de lote (RF-09)</h3>
            <p className="text-textMuted text-xs mt-0.5">Nuevo lote para un alimento existente</p>
          </div>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* Info del alimento seleccionado (solo lectura) */}
          <div className="mb-5 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Alimento seleccionado</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <i className={`fa-solid ${getCategoryIcon(alimento.categoria)} text-primary`}></i>
              </div>
              <div>
                <p className="font-bold text-textDark">{alimento.nombre}</p>
                <p className="text-xs text-textMuted capitalize">{alimento.categoria} · {alimento.unidad}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-critico/10 border border-critico/20 text-critico text-sm flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Código de Lote */}
            <div>
              <label className="block text-textMuted text-xs font-semibold uppercase tracking-wide mb-1">
                Código de lote <span className="text-critico">*</span>
              </label>
              <input
                className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                placeholder="Ej: LOTE-2026-001"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
              />
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-textMuted text-xs font-semibold uppercase tracking-wide mb-1">
                Cantidad ({alimento.unidad}) <span className="text-critico">*</span>
              </label>
              <input
                className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                type="number"
                min="0.01"
                step="any"
                placeholder={`Ej: 10 ${alimento.unidad}`}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>

            {/* Fecha de vencimiento */}
            <div>
              <label className="block text-textMuted text-xs font-semibold uppercase tracking-wide mb-1">
                Fecha de vencimiento <span className="text-critico">*</span>
              </label>
              <input
                className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                type="datetime-local"
                value={fechaCaducidad}
                onChange={(e) => setFechaCaducidad(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 mt-1">Debe ser una fecha futura.</p>
            </div>
          </div>

          {/* Botones */}
          <div className="pt-5 mt-6 border-t border-gray-100 flex justify-end gap-3">
            <button onClick={onCerrar} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Cancelar
            </button>
            <button onClick={handleGuardar} className="btn-primary flex items-center gap-2">
              <i className="fa-solid fa-layer-group"></i>
              Registrar Lote
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCategoryIcon(cat) {
  switch ((cat || '').toLowerCase()) {
    case 'carnico': return 'fa-drumstick-bite'
    case 'lacteo': return 'fa-cheese'
    case 'vegetal': return 'fa-apple-whole'
    case 'seco': return 'fa-wheat-awn'
    case 'preparado': return 'fa-utensils'
    default: return 'fa-box'
  }
}

export default AddLoteModal
