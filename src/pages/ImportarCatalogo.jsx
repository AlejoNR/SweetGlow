import { useState, useEffect, useRef } from 'react'
import { AdaptadorCatalogoCSV } from '../core/adapters/AdaptadorCatalogoCSV.js'
import { FirestoreGateway } from '../core/persistence/FirestoreGateway.js'
import { RepositorioInventario } from '../core/services/RepositorioInventario.js'
import { RepositorioCompras } from '../core/services/RepositorioCompras.js'
import { RepositorioVentas } from '../core/services/RepositorioVentas.js'
import { MaquillajeFactory } from '../core/factories/MaquillajeFactory.js'
import { EntradaCompra } from '../core/models/EntradaCompra.js'
import { RegistroVenta } from '../core/models/RegistroVenta.js'
import Loader from '../components/common/Loader.jsx'

function ImportarCatalogo() {
  const [delimitador, setDelimitador] = useState(',')
  const [archivo, setArchivo] = useState(null)
  const [textoCSV, setTextoCSV] = useState('')
  const [cargando, setCargando] = useState(false)
  const [historial, setHistorial] = useState([])
  const [dragActivo, setDragActivo] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [preview, setPreview] = useState(null)
  const inputRef = useRef(null)

  const repoInventario = new RepositorioInventario(new FirestoreGateway())
  const repoCompras = new RepositorioCompras()
  const repoVentas = new RepositorioVentas()
  const gatewayHistorial = new FirestoreGateway('importaciones')

  useEffect(() => {
    const cargarHistorial = async () => {
      const data = await gatewayHistorial.obtener()
      setHistorial((data || []).sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)).slice(0, 20))
    }
    cargarHistorial()
  }, [])

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActivo(true)
    else if (e.type === 'dragleave') setDragActivo(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault(); e.stopPropagation()
    setDragActivo(false)
    const file = e.dataTransfer.files?.[0]
    if (file) procesarArchivoSeleccionado(file)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) procesarArchivoSeleccionado(file)
  }

  const procesarArchivoSeleccionado = async (file) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      alert('Solo se permiten archivos .csv o .txt (exportado desde Excel)')
      return
    }
    setArchivo(file)
    const texto = await file.text()
    setTextoCSV(texto)
    setResultado(null)

    // Generar preview
    const adaptador = new AdaptadorCatalogoCSV(texto, delimitador)
    const filas = await adaptador.obtenerDatos()
    setPreview(filas.slice(0, 5))
  }

  const ejecutarImportacion = async () => {
    if (!textoCSV || !archivo) return
    setCargando(true)
    setResultado(null)

    const adaptador = new AdaptadorCatalogoCSV(textoCSV, delimitador)
    const filas = await adaptador.obtenerDatos()

    if (filas.length === 0) {
      setResultado({ error: 'No se encontraron filas válidas en el archivo. Revisa el delimitador.' })
      setCargando(false)
      return
    }

    // === OPCIÓN A: Agrupar duplicados por nombre ===
    // Clave: nombre (normalizado en minúsculas sin espacios extra)
    const mapaProductos = new Map()

    for (const fila of filas) {
      const clave = fila.nombre.trim().toLowerCase()
      if (!mapaProductos.has(clave)) {
        mapaProductos.set(clave, [])
      }
      mapaProductos.get(clave).push(fila)
    }

    let productosCreados = 0
    let comprasCreadas = 0
    let ventasCreadas = 0
    const errores = []

    for (const [, entradas] of mapaProductos) {
      const primera = entradas[0]

      try {
        // Stock total = suma de todas las existencias de ese producto
        const stockTotal = entradas.reduce((acc, e) => acc + (e.stockActual || 0), 0)
        // Precio de venta más reciente (última entrada)
        const ultimaEntrada = entradas[entradas.length - 1]

        // Crear o actualizar el producto en el catálogo
        const productoExistente = (await repoInventario.listar())
          .find(p => p.nombre.toLowerCase().trim() === primera.nombre.toLowerCase().trim())

        let productoId
        if (productoExistente) {
          // Actualizar stock sumando el nuevo
          const actualizado = { ...productoExistente, cantidad: productoExistente.cantidad + stockTotal }
          await repoInventario.guardar({ ...actualizado, toJSON: () => actualizado })
          productoId = productoExistente.id
        } else {
          const producto = MaquillajeFactory.crearProducto(primera.categoria || 'rostro', {
            nombre: primera.nombre,
            marca: primera.marca || '',
            cantidad: stockTotal,
            precioCompra: ultimaEntrada.precioCompra,
            porcentajeGanancia: ultimaEntrada.porcentajeGanancia,
            descripcion: primera.descripcion || ''
          })
          await repoInventario.guardar(producto)
          productoId = producto.id
          productosCreados++
        }

        // Crear una EntradaCompra por CADA fila (aunque sean del mismo producto)
        for (const entrada of entradas) {
          const compra = new EntradaCompra({
            productoId,
            productoNombre: primera.nombre,
            marca: primera.marca || '',
            categoria: primera.categoria || 'rostro',
            cantidad: entrada.cantidadCompra || entrada.stockActual || 0,
            precioCompra: entrada.precioCompra,
            precioVenta: entrada.precioVenta,
            porcentajeGanancia: entrada.porcentajeGanancia,
            fechaCompra: new Date().toISOString()
          })
          await repoCompras.registrar(compra)
          comprasCreadas++

          // Si había ventas registradas en el excel, las importamos también
          if (entrada.unidadesVendidas > 0) {
            const venta = new RegistroVenta({
              productoId,
              productoNombre: primera.nombre,
              marca: primera.marca || '',
              categoria: primera.categoria || 'rostro',
              cantidadVendida: entrada.unidadesVendidas,
              precioVenta: entrada.precioVenta,
              fechaVenta: new Date().toISOString(),
              nota: 'Importado desde Excel'
            })
            await repoVentas.registrar(venta)
            ventasCreadas++
          }
        }
      } catch (e) {
        errores.push(`${primera.nombre}: ${e.message}`)
      }
    }

    // Guardar en historial
    const registro = {
      id: crypto.randomUUID(),
      fechaHora: new Date().toISOString(),
      archivo: archivo.name,
      totalFilas: filas.length,
      productosCreados,
      comprasCreadas,
      ventasCreadas,
      errores: errores.length,
    }
    await gatewayHistorial.guardar(registro.id, registro)

    setResultado({ productosCreados, comprasCreadas, ventasCreadas, totalFilas: filas.length, errores })
    setCargando(false)
    setArchivo(null)
    setTextoCSV('')
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
    
    // Recargar historial
    const data = await gatewayHistorial.obtener()
    setHistorial((data || []).sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)).slice(0, 20))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-textDark text-2xl font-bold">Importar Inventario</h1>
        <p className="text-textMuted text-sm mt-1">Carga tu Excel de inventario (exportado como CSV). Los productos duplicados se agrupan automáticamente.</p>
      </div>

      {/* Card principal */}
      <div className="card p-8">
        <div className="flex items-center gap-4 border-b border-border pb-6 mb-6">
          <div className="w-12 h-12 bg-primaryLt text-primary flex items-center justify-center rounded-xl text-2xl shrink-0">
            <i className="fa-solid fa-file-excel"></i>
          </div>
          <div>
            <h2 className="text-textDark font-semibold text-lg">Cargar archivo CSV / Excel</h2>
            <p className="text-textMuted text-sm">Guarda tu Excel como "CSV delimitado por comas" y súbelo aquí.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Opciones */}
          <div className="space-y-5">
            <div>
              <label className="block text-textDark text-sm font-semibold mb-2">Delimitador de columnas</label>
              <select value={delimitador} onChange={(e) => setDelimitador(e.target.value)} className="input-light">
                <option value=",">Coma (,) — CSV estándar</option>
                <option value=";">Punto y coma (;) — CSV europeo</option>
                <option value={"\t"}>Tabulación — TSV</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1.5">
              <p className="font-bold text-sm flex items-center gap-2"><i className="fa-solid fa-circle-info"></i> ¿Cómo exportar tu Excel?</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Abre tu archivo en Excel u Open Office.</li>
                <li>Ve a <strong>Archivo → Guardar Como</strong>.</li>
                <li>Elige el formato <strong>CSV (delimitado por comas)</strong>.</li>
                <li>Súbelo aquí.</li>
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
              <p className="font-bold mb-1">Columnas reconocidas:</p>
              <p><strong>Producto</strong>, Cantidad ini, unida vendia, <strong>Precio distribuidora</strong>, <strong>Precio venta</strong>, existencia, venta neta</p>
            </div>
          </div>

          {/* Drag & Drop */}
          <div
            className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center transition-colors ${
              dragActivo ? 'border-primary bg-primaryLt/50' : 'border-border bg-inputBg hover:bg-black/5'
            }`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          >
            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-4 text-2xl shadow-lg shadow-primary/30">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <p className="text-textDark font-semibold mb-1">
              {archivo ? archivo.name : 'Arrastra aquí tu archivo CSV'}
            </p>
            <p className="text-textMuted text-xs mb-6">
              {archivo ? `${(archivo.size / 1024).toFixed(1)} KB listo para procesar` : 'Formatos: .csv, .txt'}
            </p>
            <input type="file" accept=".csv,.txt" onChange={handleFileChange} className="hidden" ref={inputRef} />
            <button onClick={() => inputRef.current?.click()} className="btn-ghost border border-border bg-white text-sm py-2 px-5">
              <i className="fa-solid fa-folder-open mr-2"></i> Explorar equipo
            </button>
          </div>
        </div>

        {/* Preview */}
        {preview && preview.length > 0 && (
          <div className="mb-6">
            <h3 className="text-textDark font-semibold text-sm mb-2 flex items-center gap-2">
              <i className="fa-solid fa-eye text-primary"></i> Vista previa (primeras {preview.length} filas)
            </h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-inputBg text-textMuted font-semibold">
                  <tr>
                    {['Producto','Categoría','Stock','Precio Compra','Precio Venta','Ganancia %'].map(h => (
                      <th key={h} className="px-3 py-2 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.map((f, i) => (
                    <tr key={i} className="hover:bg-inputBg/50">
                      <td className="px-3 py-2 font-medium text-textDark">{f.nombre}</td>
                      <td className="px-3 py-2 capitalize text-textMuted">{f.categoria || 'rostro'}</td>
                      <td className="px-3 py-2 text-textMuted">{f.stockActual}</td>
                      <td className="px-3 py-2 text-textMuted">${f.precioCompra?.toLocaleString('es-CO')}</td>
                      <td className="px-3 py-2 text-emerald-600 font-medium">${f.precioVenta?.toLocaleString('es-CO')}</td>
                      <td className="px-3 py-2 text-blue-600 font-medium">{f.porcentajeGanancia}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resultado */}
        {resultado && !resultado.error && (
          <div className="mb-6 p-4 rounded-xl border bg-primaryLt border-primary/20 text-sidebarBg">
            <p className="font-semibold mb-2 flex items-center gap-2"><i className="fa-solid fa-check-circle text-primary"></i> Importación completada</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-xs opacity-70">Productos creados</p><p className="font-bold text-lg">{resultado.productosCreados}</p></div>
              <div><p className="text-xs opacity-70">Entradas de compra</p><p className="font-bold text-lg">{resultado.comprasCreadas}</p></div>
              <div><p className="text-xs opacity-70">Ventas importadas</p><p className="font-bold text-lg">{resultado.ventasCreadas}</p></div>
            </div>
            {resultado.errores.length > 0 && (
              <ul className="mt-3 text-xs space-y-1 opacity-80 list-disc list-inside">
                {resultado.errores.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        )}
        {resultado?.error && (
          <div className="mb-6 p-4 rounded-xl border bg-red-50 border-red-200 text-red-700 text-sm">{resultado.error}</div>
        )}

        <button
          onClick={ejecutarImportacion}
          disabled={!archivo || cargando}
          className="btn-dark w-full shadow-lg shadow-sidebarBg/20 disabled:opacity-50"
        >
          {cargando ? (
            <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Procesando y guardando en Firestore...</>
          ) : (
            <><i className="fa-solid fa-gears mr-2"></i> Procesar e Importar Inventario</>
          )}
        </button>
      </div>

      {/* Historial */}
      <div>
        <h3 className="text-textDark font-semibold flex items-center gap-2 mb-4">
          <i className="fa-solid fa-clock-rotate-left"></i> Historial de Importaciones
        </h3>
        <div className="card overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-inputBg border-b border-border text-textMuted text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Archivo</th>
                <th className="px-5 py-3 text-center">Productos</th>
                <th className="px-5 py-3 text-center">Compras</th>
                <th className="px-5 py-3 text-center">Ventas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {historial.length === 0 ? (
                <tr><td colSpan="5" className="px-5 py-8 text-center text-textMuted">Sin importaciones recientes.</td></tr>
              ) : (
                historial.map((reg) => (
                  <tr key={reg.id} className="hover:bg-black/[0.02]">
                    <td className="px-5 py-3 text-textDark text-xs">
                      {new Date(reg.fechaHora).toLocaleString('es-CO', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </td>
                    <td className="px-5 py-3 text-textMuted flex items-center gap-1.5">
                      <i className="fa-solid fa-file-csv opacity-50"></i> {reg.archivo}
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-textDark">{reg.productosCreados}</td>
                    <td className="px-5 py-3 text-center font-bold text-blue-600">{reg.comprasCreadas}</td>
                    <td className="px-5 py-3 text-center font-bold text-emerald-600">{reg.ventasCreadas}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
export default ImportarCatalogo
