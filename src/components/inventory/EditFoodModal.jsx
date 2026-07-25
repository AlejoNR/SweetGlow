import { useState, useEffect } from 'react'
import { MaquillajeFactory } from '../../core/factories/MaquillajeFactory.js'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../core/firebase/firebaseConfig.js'

function EditFoodModal({ producto, onActualizar, onCerrar }) {
  const [categoria, setCategoria] = useState(producto.categoria || 'rostro')
  const [datos, setDatos] = useState({ ...producto })
  
  const [imagenBlob, setImagenBlob] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setCategoria(producto.categoria || 'rostro')
    setDatos({ ...producto })
  }, [producto])

  const set = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))

  const handleImagenChange = (e) => {
    if (e.target.files[0]) {
      setImagenBlob(e.target.files[0])
    }
  }

  const handleGuardar = async () => {
    setError('')
    try {
      setSubiendo(true)
      let imagenUrl = datos.imagenUrl

      if (imagenBlob) {
        const ext = imagenBlob.name.split('.').pop()
        const filename = `${crypto.randomUUID()}.${ext}`
        const storageRef = ref(storage, `productos/${filename}`)
        await uploadBytes(storageRef, imagenBlob)
        imagenUrl = await getDownloadURL(storageRef)
      }

      // Reconstruimos la instancia usando el factory por si cambió la categoría o datos
      const actualizado = MaquillajeFactory.crearProducto(categoria, {
        ...datos,
        imagenUrl
      })
      await onActualizar(actualizado)
    } catch (e) {
      setError(e.message)
      setSubiendo(false)
    }
  }

  const compra = Number(datos.precioCompra) || 0
  const ganancia = Number(datos.porcentajeGanancia) || 0
  const precioVentaCalc = compra + (compra * (ganancia / 100))

  return (
    <div className="fixed inset-0 bg-sidebarBg/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="card p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-textDark text-lg font-semibold mb-4">Editar Producto</h3>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-critico/10 border border-critico/20 text-critico text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="w-24 h-24 rounded-lg bg-inputBg border border-border flex items-center justify-center overflow-hidden shrink-0">
              {imagenBlob ? (
                <img src={URL.createObjectURL(imagenBlob)} alt="Preview" className="w-full h-full object-cover" />
              ) : datos.imagenUrl ? (
                <img src={datos.imagenUrl} alt="Producto" className="w-full h-full object-cover" />
              ) : (
                <i className="fa-solid fa-image text-textMuted text-2xl"></i>
              )}
            </div>
            <div className="flex-1">
               <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Foto del producto (Reemplazar)</label>
               <input type="file" accept="image/*" onChange={handleImagenChange} className="block w-full text-sm text-textMuted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Categoría</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="input-light">
                <option value="rostro">Rostro</option>
                <option value="ojos">Ojos</option>
                <option value="labios">Labios</option>
                <option value="cuidado_piel">Cuidado de la Piel</option>
              </select>
            </div>
            <div>
               <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Nombre del Producto</label>
               <input className="input-light" value={datos.nombre} onChange={(e) => set('nombre', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
               <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Marca</label>
               <input className="input-light" value={datos.marca} onChange={(e) => set('marca', e.target.value)} />
            </div>
            <div>
               <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Stock</label>
               <input className="input-light" type="number" value={datos.cantidad} onChange={(e) => set('cantidad', e.target.value)} />
            </div>
          </div>

          <div>
             <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Tono/Variante (Opcional)</label>
             <input className="input-light" value={datos.tono} onChange={(e) => set('tono', e.target.value)} />
          </div>

          <div className="p-4 bg-inputBg rounded-lg border border-border grid grid-cols-3 gap-4">
            <div>
               <label className="block text-textMuted text-[10px] font-bold uppercase tracking-wide mb-1.5">Precio Compra ($)</label>
               <input className="input-light" type="number" value={datos.precioCompra} onChange={(e) => set('precioCompra', e.target.value)} />
            </div>
            <div>
               <label className="block text-textMuted text-[10px] font-bold uppercase tracking-wide mb-1.5">% Ganancia</label>
               <input className="input-light" type="number" value={datos.porcentajeGanancia} onChange={(e) => set('porcentajeGanancia', e.target.value)} />
            </div>
            <div>
               <label className="block text-textMuted text-[10px] font-bold uppercase tracking-wide mb-1.5">Precio Venta</label>
               <div className="input-light bg-sidebarBg text-textDark font-bold flex items-center justify-center">
                 ${precioVentaCalc.toFixed(2)}
               </div>
            </div>
          </div>

          <div>
             <label className="block text-textMuted text-xs font-medium uppercase tracking-wide mb-1.5">Descripción</label>
             <textarea className="input-light h-20 resize-none" value={datos.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onCerrar} disabled={subiendo} className="btn-ghost flex-1 border border-border disabled:opacity-50">Cancelar</button>
          <button onClick={handleGuardar} disabled={subiendo} className="btn-primary flex-1 disabled:opacity-50">
            {subiendo ? <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-spinner fa-spin"></i> Guardando...</span> : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
export default EditFoodModal
