import { useState, useEffect } from 'react'
import { RepositorioInventario } from '../../core/services/RepositorioInventario.js'
import { RepositorioCompras } from '../../core/services/RepositorioCompras.js'
import { FirestoreGateway } from '../../core/persistence/FirestoreGateway.js'

function AddCompraModal({ onGuardarExitoso, onCerrar }) {
  const [productos, setProductos] = useState([])
  const [productoId, setProductoId] = useState('')
  
  const [marca, setMarca] = useState('')
  const [categoria, setCategoria] = useState('rostro')
  const [cantidad, setCantidad] = useState('')
  const [precioCompra, setPrecioCompra] = useState('')
  const [porcentajeGanancia, setPorcentajeGanancia] = useState('30')
  const [precioVenta, setPrecioVenta] = useState('')

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const repoInventario = new RepositorioInventario(new FirestoreGateway())
  const repoCompras = new RepositorioCompras()

  useEffect(() => {
    const cargar = async () => {
      const lista = await repoInventario.listar()
      setProductos(lista)
      if (lista.length > 0) setProductoId(lista[0].id)
      else setProductoId('nuevo')
    }
    cargar()
  }, [])

  // Al cambiar producto seleccionado, precargar datos de marca/categoría
  useEffect(() => {
    if (productoId) {
      const p = productos.find(x => x.id === productoId)
      if (p) {
        setMarca(p.marca || '')
        setCategoria(p.categoria || 'rostro')
        if (p.precioCompra) setPrecioCompra(String(p.precioCompra))
        if (p.porcentajeGanancia) setPorcentajeGanancia(String(p.porcentajeGanancia))
        if (p.precioVenta) {
          setPrecioVenta(String(p.precioVenta))
        } else if (p.precioCompra) {
          const ganancia = p.porcentajeGanancia || 30
          const venta = p.precioCompra + (p.precioCompra * (ganancia / 100))
          setPrecioVenta(String(venta))
        }
      }
    }
  }, [productoId, productos])

  const handlePrecioCompraChange = (e) => {
    const val = e.target.value
    setPrecioCompra(val)
    const compra = Number(val) || 0
    const ganancia = Number(porcentajeGanancia) || 0
    const venta = compra + (compra * (ganancia / 100))
    setPrecioVenta(venta ? String(venta.toFixed(0)) : '')
  }

  const handlePorcentajeGananciaChange = (e) => {
    const val = e.target.value
    setPorcentajeGanancia(val)
    const compra = Number(precioCompra) || 0
    const ganancia = Number(val) || 0
    const venta = compra + (compra * (ganancia / 100))
    setPrecioVenta(venta ? String(venta.toFixed(0)) : '')
  }

  const handlePrecioVentaChange = (e) => {
    const val = e.target.value
    setPrecioVenta(val)
    const compra = Number(precioCompra) || 0
    const venta = Number(val) || 0
    if (compra > 0) {
      const ganancia = ((venta - compra) / compra) * 100
      setPorcentajeGanancia(String(Math.round(ganancia * 100) / 100))
    }
  }

  const compraNum = Number(precioCompra) || 0
  const gananciaNum = Number(porcentajeGanancia) || 0
  const precioVentaNum = Number(precioVenta) || 0

  const handleGuardar = async () => {
    setError('')
    const cantNum = Number(cantidad)
    if (!cantNum || cantNum <= 0) {
      setError('La cantidad comprada debe ser mayor a 0.')
      return
    }
    if (!compraNum || compraNum <= 0) {
      setError('El precio de compra debe ser mayor a 0.')
      return
    }

    setGuardando(true)
    try {
      const prodExistente = productos.find(x => x.id === productoId)
      if (!prodExistente) throw new Error('Producto no encontrado.')

      const actualizado = {
        ...prodExistente,
        cantidad: prodExistente.cantidad + cantNum,
        precioCompra: compraNum,
        porcentajeGanancia: gananciaNum,
        precioVenta: precioVentaNum,
        toJSON: function() { return { ...this } }
      }
      await repoInventario.guardar(actualizado)

      // Registrar Entrada de Compra
      await repoCompras.registrar({
        productoId: prodExistente.id,
        productoNombre: prodExistente.nombre,
        marca: prodExistente.marca || marca,
        categoria: prodExistente.categoria || categoria,
        cantidad: cantNum,
        precioCompra: compraNum,
        precioVenta: precioVentaNum,
        porcentajeGanancia: gananciaNum,
        fechaCompra: new Date().toISOString(),
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
      <div className="card p-6 w-full max-w-lg shadow-pinkGlow max-h-[90vh] overflow-y-auto">
        <h3 className="text-textDark text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-cart-plus text-primary"></i> Registrar Nueva Compra
        </h3>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-textMuted text-xs font-semibold uppercase mb-1">Seleccionar Producto</label>
            <select value={productoId} onChange={(e) => setProductoId(e.target.value)} className="input-field">
              {productos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} (Stock actual: {p.cantidad})</option>
              ))}
            </select>
          </div>

          {/* MARCA DEL PRODUCTO SELECCIONADO (SOLO LECTURA) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-textMuted text-xs font-semibold uppercase mb-1">Marca</label>
              <input type="text" value={marca} disabled className="input-field bg-gray-50 opacity-70" />
            </div>
          </div>

          {/* DATOS DE LA COMPRA (SIEMPRE VISIBLES) */}
          <div className="pt-2 border-t border-border">
            <label className="block text-textMuted text-xs font-semibold uppercase mb-1">Cantidad Comprada</label>
            <input type="number" min="1" placeholder="Ej: 5" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="input-field font-bold bg-amber-50 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20" />
          </div>

          <div className="p-4 bg-primaryLt/40 rounded-xl border border-primary/20 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-textMuted text-[10px] font-bold uppercase mb-1">Precio Compra ($)</label>
              <input type="number" placeholder="0" value={precioCompra} onChange={handlePrecioCompraChange} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-textMuted text-[10px] font-bold uppercase mb-1">% Ganancia</label>
              <input type="number" placeholder="30" value={porcentajeGanancia} onChange={handlePorcentajeGananciaChange} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-textMuted text-[10px] font-bold uppercase mb-1">Precio Venta ($)</label>
              <input type="number" placeholder="0" value={precioVenta} onChange={handlePrecioVentaChange} className="input-field text-sm text-primary font-extrabold border-primary/30" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onCerrar} disabled={guardando} className="btn-ghost flex-1">Cancelar</button>
          <button onClick={handleGuardar} disabled={guardando} className="btn-primary flex-1">
            {guardando ? <><i className="fa-solid fa-spinner fa-spin"></i> Guardando...</> : 'Registrar Compra'}
          </button>
        </div>
      </div>
    </div>
  )
}
export default AddCompraModal
