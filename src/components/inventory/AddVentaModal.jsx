import { useState, useEffect } from 'react'
import { RepositorioInventario } from '../../core/services/RepositorioInventario.js'
import { RepositorioVentas } from '../../core/services/RepositorioVentas.js'
import { FirestoreGateway } from '../../core/persistence/FirestoreGateway.js'

function AddVentaModal({ onGuardarExitoso, onCerrar }) {
  const [productos, setProductos] = useState([])
  const [productoId, setProductoId] = useState('')
  const [cantidadVendida, setCantidadVendida] = useState('1')
  const [precioVenta, setPrecioVenta] = useState('')
  const [nota, setNota] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const repoInventario = new RepositorioInventario(new FirestoreGateway())
  const repoVentas = new RepositorioVentas()

  useEffect(() => {
    const cargar = async () => {
      const lista = await repoInventario.listar()
      setProductos(lista)
      if (lista.length > 0) setProductoId(lista[0].id)
    }
    cargar()
  }, [])

  const productoSeleccionado = productos.find(x => x.id === productoId)

  useEffect(() => {
    if (productoSeleccionado) {
      setPrecioVenta(String(productoSeleccionado.precioVenta || 0))
    }
  }, [productoId])

  const cantNum = Number(cantidadVendida) || 0
  const precioNum = Number(precioVenta) || 0
  const totalVentaCalc = cantNum * precioNum

  const handleGuardar = async () => {
    setError('')
    if (!productoSeleccionado) {
      setError('Debes seleccionar un producto válido.')
      return
    }
    if (cantNum <= 0) {
      setError('La cantidad vendida debe ser mayor a 0.')
      return
    }
    if (cantNum > productoSeleccionado.cantidad) {
      setError(`Stock insuficiente. Solo tienes ${productoSeleccionado.cantidad} unidades disponibles.`)
      return
    }

    setGuardando(true)
    try {
      // 1. Descontar del inventario
      const nuevoStock = productoSeleccionado.cantidad - cantNum
      const productoActualizado = {
        ...productoSeleccionado,
        cantidad: nuevoStock,
        toJSON: function() { return { ...this } }
      }
      await repoInventario.guardar(productoActualizado)

      // 2. Registrar venta
      await repoVentas.registrar({
        productoId: productoSeleccionado.id,
        productoNombre: productoSeleccionado.nombre,
        marca: productoSeleccionado.marca || '',
        categoria: productoSeleccionado.categoria || 'rostro',
        cantidadVendida: cantNum,
        precioVenta: precioNum,
        fechaVenta: new Date().toISOString(),
        nota,
      })

      setGuardando(false)
      onGuardarExitoso()
    } catch (e) {
      setError(e.message)
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-sidebarBg/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="card p-6 w-full max-w-lg shadow-pinkGlow">
        <h3 className="text-textDark text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-[#EC4899] fa-basket-shopping text-primary"></i> Registrar Venta
        </h3>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {productos.length === 0 ? (
          <p className="text-textMuted text-sm py-4 text-center">No hay productos en inventario para vender.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-textMuted text-xs font-semibold uppercase mb-1">Seleccionar Producto</label>
              <select value={productoId} onChange={(e) => setProductoId(e.target.value)} className="input-field">
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.cantidad})</option>
                ))}
              </select>
            </div>

            {productoSeleccionado && (
              <div className="p-3 bg-primaryLt/30 rounded-xl border border-primary/20 flex justify-between items-center text-xs">
                <span className="text-textMuted">Stock Disponible: <strong className="text-textDark text-sm">{productoSeleccionado.cantidad}</strong> unidades</span>
                <span className="text-textMuted">Precio Venta Sugerido: <strong className="text-emerald-600 text-sm">${productoSeleccionado.precioVenta?.toLocaleString('es-CO')}</strong></span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-textMuted text-xs font-semibold uppercase mb-1">Cantidad a Vender</label>
                <input type="number" min="1" max={productoSeleccionado?.cantidad} value={cantidadVendida} onChange={(e) => setCantidadVendida(e.target.value)} className="input-field font-bold" />
              </div>
              <div>
                <label className="block text-textMuted text-xs font-semibold uppercase mb-1">Precio Venta Unitario ($)</label>
                <input type="number" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} className="input-field font-bold" />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
              <span className="text-emerald-800 text-xs font-semibold uppercase">Total de la Venta:</span>
              <span className="text-emerald-600 font-extrabold text-xl">${totalVentaCalc.toLocaleString('es-CO')}</span>
            </div>

            <div>
              <label className="block text-textMuted text-xs font-semibold uppercase mb-1">Nota u Observación (Opcional)</label>
              <input type="text" placeholder="Ej: Cliente frecuente / Transferencia" value={nota} onChange={(e) => setNota(e.target.value)} className="input-field" />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={onCerrar} disabled={guardando} className="btn-ghost flex-1">Cancelar</button>
          <button onClick={handleGuardar} disabled={guardando || productos.length === 0} className="btn-primary flex-1">
            {guardando ? <><i className="fa-solid fa-spinner fa-spin"></i> Registrando...</> : 'Confirmar Venta'}
          </button>
        </div>
      </div>
    </div>
  )
}
export default AddVentaModal
