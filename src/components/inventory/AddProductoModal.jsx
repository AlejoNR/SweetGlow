import { useState } from 'react'
import { RepositorioInventario } from '../../core/services/RepositorioInventario.js'
import { FirestoreGateway } from '../../core/persistence/FirestoreGateway.js'
import { MaquillajeFactory } from '../../core/factories/MaquillajeFactory.js'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../core/firebase/firebaseConfig.js'

function AddProductoModal({ onGuardarExitoso, onCerrar }) {
  const [categoria, setCategoria] = useState('rostro')
  const [nombre, setNombre] = useState('')
  const [marca, setMarca] = useState('')
  const [tono, setTono] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [precioCompra, setPrecioCompra] = useState('')
  const [porcentajeGanancia, setPorcentajeGanancia] = useState('30')
  const [precioVenta, setPrecioVenta] = useState('')
  const [imagenBlob, setImagenBlob] = useState(null)

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const repoInventario = new RepositorioInventario(new FirestoreGateway())

  const handleImagenChange = (e) => {
    if (e.target.files[0]) setImagenBlob(e.target.files[0])
  }

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
    if (!nombre.trim()) {
      setError('El nombre del producto es obligatorio.')
      return
    }
    const cantNum = Number(cantidad)
    if (!cantNum || cantNum < 0) {
      setError('La cantidad inicial debe ser 0 o mayor.')
      return
    }
    if (!compraNum || compraNum <= 0) {
      setError('El precio de compra debe ser mayor a 0.')
      return
    }

    setGuardando(true)
    try {
      let imagenUrl = ''
      if (imagenBlob) {
        const ext = imagenBlob.name.split('.').pop()
        const filename = `${crypto.randomUUID()}.${ext}`
        const storageRef = ref(storage, `productos/${filename}`)
        await uploadBytes(storageRef, imagenBlob)
        imagenUrl = await getDownloadURL(storageRef)
      }

      const nuevoProd = MaquillajeFactory.crearProducto(categoria, {
        nombre: nombre.trim(),
        marca,
        tono,
        descripcion,
        cantidad: cantNum,
        precioCompra: compraNum,
        porcentajeGanancia: gananciaNum,
        precioVenta: precioVentaNum,
        imagenUrl,
      })

      await repoInventario.guardar(nuevoProd)
      setGuardando(false)
      onGuardarExitoso()
    } catch (e) {
      setError(e.message)
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-sidebarBg/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="card p-6 w-full max-w-2xl shadow-pinkGlow max-h-[90vh] overflow-y-auto">
        <h3 className="text-textDark text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-plus-circle text-primary"></i> Registrar Nuevo Producto
        </h3>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Imagen */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-24 h-24 rounded-xl bg-inputBg border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {imagenBlob ? (
                <img src={URL.createObjectURL(imagenBlob)} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <i className="fa-solid fa-image text-textMuted text-3xl"></i>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-textMuted text-xs font-semibold uppercase mb-1">Foto del producto (Opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
                className="block w-full text-sm text-textMuted file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
          </div>

          {/* Categoría + Nombre */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-textMuted text-xs font-semibold uppercase mb-1">Categoría</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="input-field">
                <option value="rostro">Rostro</option>
                <option value="ojos">Ojos</option>
                <option value="labios">Labios</option>
                <option value="cuidado_piel">Cuidado de la Piel</option>
              </select>
            </div>
            <div>
              <label className="block text-textMuted text-xs font-semibold uppercase mb-1">Nombre del Producto *</label>
              <input
                type="text"
                placeholder="Ej: Base Líquida"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Marca + Tono */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-textMuted text-xs font-semibold uppercase mb-1">Marca (Opcional)</label>
              <input
                type="text"
                placeholder="Ej: MAC"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-textMuted text-xs font-semibold uppercase mb-1">Tono / Variante (Opcional)</label>
              <input
                type="text"
                placeholder="Ej: NC20"
                value={tono}
                onChange={(e) => setTono(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-textMuted text-xs font-semibold uppercase mb-1">Descripción (Opcional)</label>
            <textarea
              className="input-field h-16 resize-none"
              placeholder="Breve descripción del producto..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          {/* Cantidad inicial */}
          <div>
            <label className="block text-textMuted text-xs font-semibold uppercase mb-1">Cantidad Inicial en Stock</label>
            <input
              type="number"
              min="0"
              placeholder="Ej: 10"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="input-field font-bold bg-amber-50 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
            />
          </div>

          {/* Precios */}
          <div className="p-4 bg-primaryLt/40 rounded-xl border border-primary/20 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-textMuted text-[10px] font-bold uppercase mb-1">Precio Compra ($)</label>
              <input
                type="number"
                placeholder="0"
                value={precioCompra}
                onChange={handlePrecioCompraChange}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-textMuted text-[10px] font-bold uppercase mb-1">% Ganancia</label>
              <input
                type="number"
                placeholder="30"
                value={porcentajeGanancia}
                onChange={handlePorcentajeGananciaChange}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-textMuted text-[10px] font-bold uppercase mb-1">Precio Venta ($)</label>
              <input
                type="number"
                placeholder="0"
                value={precioVenta}
                onChange={handlePrecioVentaChange}
                className="input-field text-sm text-primary font-extrabold border-primary/30"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onCerrar} disabled={guardando} className="btn-ghost flex-1">Cancelar</button>
          <button onClick={handleGuardar} disabled={guardando} className="btn-primary flex-1">
            {guardando
              ? <><i className="fa-solid fa-spinner fa-spin"></i> Guardando...</>
              : <><i className="fa-solid fa-plus"></i> Crear Producto</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddProductoModal
