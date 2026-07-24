import { useState, useEffect, useRef } from 'react'
import { AdaptadorCatalogoCSV } from '../core/adapters/AdaptadorCatalogoCSV.js'
import { AlimentoFactory } from '../core/factories/AlimentoFactory.js'
import { LocalStorageGateway } from '../core/persistence/LocalStorageGateway.js'
import { RepositorioInventario } from '../core/services/RepositorioInventario.js'

function ImportarCatalogo() {
  const [proveedor, setProveedor] = useState('Distribuidora Local Caquetá')
  const [delimitador, setDelimitador] = useState(',')
  const [archivo, setArchivo] = useState(null)
  const [textoCSV, setTextoCSV] = useState('')
  const [cargando, setCargando] = useState(false)
  const [historial, setHistorial] = useState([])
  const [dragActivo, setDragActivo] = useState(false)
  const [resultado, setResultado] = useState(null)
  const inputRef = useRef(null)

  const gateway = new LocalStorageGateway()
  const repo = new RepositorioInventario(gateway)

  useEffect(() => {
    const cargarHistorial = async () => {
      const data = await gateway.obtener('importaciones')
      setHistorial(data || [])
    }
    cargarHistorial()
  }, [])

  const guardarEnHistorial = async (registro) => {
    const data = (await gateway.obtener('importaciones')) || []
    const nuevoHistorial = [registro, ...data].slice(0, 50) // Mantener últimos 50
    await gateway.guardar('importaciones', nuevoHistorial)
    setHistorial(nuevoHistorial)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActivo(true)
    else if (e.type === 'dragleave') setDragActivo(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActivo(false)
    const file = e.dataTransfer.files?.[0]
    if (file) procesarArchivoSeleccionado(file)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) procesarArchivoSeleccionado(file)
  }

  const procesarArchivoSeleccionado = async (file) => {
    if (!file.name.endsWith('.csv')) {
      alert('Solo se permiten archivos .csv')
      return
    }
    setArchivo(file)
    const texto = await file.text()
    setTextoCSV(texto)
    setResultado(null)
  }

  const ejecutarImportacion = async () => {
    if (!textoCSV || !archivo) return
    setCargando(true)
    setResultado(null)

    // Si el delimitador no es coma, hacemos un reemplazo simple para el adaptador actual.
    // (Idealmente se mejoraría AdaptadorCatalogoCSV para recibir el delimitador).
    let textoProcesar = textoCSV
    if (delimitador !== ',') {
      const regex = new RegExp(delimitador, 'g')
      textoProcesar = textoProcesar.replace(regex, ',')
    }

    const adaptador = new AdaptadorCatalogoCSV(textoProcesar)
    const filas = await adaptador.obtenerDatos()

    const validos = []
    const errores = []

    for (const fila of filas) {
      try {
        validos.push(AlimentoFactory.crearAlimento(fila.categoria, fila))
      } catch (e) {
        errores.push(`${fila.nombre || 'fila'}: ${e.message}`)
      }
    }

    if (validos.length > 0) {
      await repo.guardarVarios(validos)
    }

    const estadoImportacion = errores.length === 0 ? 'Completado' : (validos.length > 0 ? 'Parcial' : 'Error')

    const registro = {
      id: crypto.randomUUID(),
      fechaHora: new Date().toISOString(),
      archivo: archivo.name,
      proveedor: proveedor || 'Desconocido',
      registros: `${validos.length} / ${filas.length}`,
      estado: estadoImportacion,
    }

    await guardarEnHistorial(registro)

    setResultado({ validos: validos.length, errores })
    setCargando(false)
    setArchivo(null)
    setTextoCSV('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-textDark text-2xl font-bold">Importación de Catálogos</h1>
        <p className="text-textMuted text-sm mt-1">Sincronice formatos externos (CSV) al modelo de inventario local</p>
      </div>

      <div className="card p-8">
        {/* Header card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primaryLt text-primary flex items-center justify-center rounded-xl text-2xl shrink-0">
              <i className="fa-solid fa-file-csv"></i>
            </div>
            <div>
              <h2 className="text-textDark font-semibold text-lg">Carga de Archivos de Proveedor</h2>
              <p className="text-textMuted text-sm">El sistema adaptará automáticamente el formato de las columnas.</p>
            </div>
          </div>
          <div className="badge-adapter shrink-0">
            <i className="fa-solid fa-plug"></i> Patrón Adapter Activo
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Left col: Options */}
          <div className="space-y-5">
            <div>
              <label className="block text-textDark text-sm font-semibold mb-2">Seleccione el Proveedor de Origen</label>
              <select 
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                className="input-light"
              >
                <option value="Distribuidora Local Caquetá">Distribuidora Local Caquetá</option>
                <option value="Almacenes Éxito">Almacenes Éxito</option>
                <option value="Fruver Central">Fruver Central</option>
                <option value="Carnes del Sur">Carnes del Sur</option>
              </select>
            </div>

            <div>
              <label className="block text-textDark text-sm font-semibold mb-2">Delimitador de columnas</label>
              <select 
                value={delimitador}
                onChange={(e) => setDelimitador(e.target.value)}
                className="input-light"
              >
                <option value=",">Coma (,)</option>
                <option value=";">Punto y coma (;)</option>
                <option value="\t">Tabulación</option>
              </select>
            </div>

            <div className="bg-[#FFF8E6] border border-[#FDE68A] text-[#92400E] p-4 rounded-xl text-xs leading-relaxed">
              <strong>Nota Importante:</strong> El adaptador transformará los nombres de columna del proveedor (Ej: <em>'F. Caducidad'</em> o <em>'Exp_Date'</em>) al formato requerido por la base de datos de SIGI de manera transparente.
            </div>
          </div>

          {/* Right col: Drag & Drop */}
          <div 
            className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center transition-colors ${
              dragActivo ? 'border-primary bg-primaryLt/50' : 'border-border bg-inputBg hover:bg-black/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-4 text-2xl shadow-lg shadow-primary/30">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <p className="text-textDark font-semibold mb-1">
              {archivo ? archivo.name : 'Arrastre y suelte su archivo aquí'}
            </p>
            <p className="text-textMuted text-xs mb-6">
              {archivo ? `${(archivo.size / 1024).toFixed(1)} KB` : 'Formato soportado: .CSV (Máximo 15 MB)'}
            </p>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              className="hidden" 
              ref={inputRef} 
            />
            <button 
              onClick={() => inputRef.current?.click()}
              className="btn-ghost border border-border bg-white text-sm py-2 px-5"
            >
              <i className="fa-solid fa-folder-open mr-2"></i> Explorar equipo
            </button>
          </div>
        </div>

        {resultado && (
          <div className={`mb-6 p-4 rounded-xl border ${resultado.validos > 0 ? 'bg-primaryLt border-primary/20 text-sidebarBg' : 'bg-critico/10 border-critico/20 text-critico'}`}>
            <p className="font-semibold mb-1">Resultado de importación:</p>
            <p className="text-sm">{resultado.validos} producto(s) importados exitosamente.</p>
            {resultado.errores.length > 0 && (
              <ul className="mt-3 text-xs space-y-1 opacity-80 list-disc list-inside">
                {resultado.errores.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                {resultado.errores.length > 5 && <li>...y {resultado.errores.length - 5} errores más.</li>}
              </ul>
            )}
          </div>
        )}

        <button 
          onClick={ejecutarImportacion}
          disabled={!archivo || cargando}
          className="btn-dark w-full shadow-lg shadow-sidebarBg/20"
        >
          {cargando ? (
            <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Procesando...</>
          ) : (
            <><i className="fa-solid fa-gears mr-2"></i> Procesar e Importar Inventario</>
          )}
        </button>
      </div>

      {/* Historial */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-textDark font-semibold flex items-center gap-2">
            <span><i className="fa-solid fa-clock-rotate-left"></i></span> Historial Reciente de Importaciones
          </h3>
          <button className="text-primary hover:text-sidebarBg text-xs font-medium transition">
            Ver registro completo
          </button>
        </div>
        
        <div className="card overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-inputBg border-b border-border text-textMuted text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Fecha y Hora</th>
                <th className="px-5 py-3">Archivo</th>
                <th className="px-5 py-3">Proveedor (Adaptador)</th>
                <th className="px-5 py-3">Registros</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {historial.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-textMuted">No hay importaciones recientes.</td>
                </tr>
              ) : (
                historial.map((reg) => (
                  <tr key={reg.id} className="hover:bg-black/[0.02] transition">
                    <td className="px-5 py-3 text-textDark">
                      {new Date(reg.fechaHora).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3 text-textMuted flex items-center gap-1.5">
                      <span className="opacity-50"><i className="fa-solid fa-file-csv"></i></span> {reg.archivo}
                    </td>
                    <td className="px-5 py-3 text-textDark">{reg.proveedor}</td>
                    <td className="px-5 py-3 text-textDark font-medium">{reg.registros}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                        reg.estado === 'Completado' ? 'bg-primaryLt text-primary border border-primary/20' : 
                        reg.estado === 'Parcial' ? 'bg-preventivo/20 text-[#92400E] border border-preventivo/30' :
                        'bg-critico/10 text-critico border border-critico/20'
                      }`}>
                        {reg.estado === 'Completado' ? '✓' : reg.estado === 'Parcial' ? '⚠' : '✕'} {reg.estado}
                      </span>
                    </td>
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
