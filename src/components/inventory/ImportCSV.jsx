import { useState } from 'react'
import { AdaptadorCatalogoCSV } from '../../core/adapters/AdaptadorCatalogoCSV.js'
import { AlimentoFactory } from '../../core/factories/AlimentoFactory.js'

/**
 * Importador CSV. Demuestra el Adapter: el archivo crudo pasa por
 * AdaptadorCatalogoCSV (normaliza columnas) y luego cada fila por el
 * AlimentoFactory. React solo orquesta, no transforma datos.
 */
function ImportCSV({ onImportar, onCerrar }) {
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(false)

  const ejemplo = 'producto,categoria,cantidad,unidad,caducidad,lote\nSalmon,carnico,5,kg,2026-06-01,CAR-099\nHarina,seco,20,kg,2026-12-01,SEC-100'

  const procesar = async (texto) => {
    setCargando(true)
    const adaptador = new AdaptadorCatalogoCSV(texto)
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
    setResultado({ validos: validos.length, errores })
    if (validos.length > 0) await onImportar(validos)
    setCargando(false)
  }

  const handleArchivo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const texto = await file.text()
    procesar(texto)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
      <div className="panel p-6 w-full max-w-lg">
        <h3 className="text-text font-semibold mb-2">Importar catalogo CSV</h3>
        <p className="text-muted text-sm mb-4">
          Las columnas se normalizan automaticamente (producto/nombre, tipo/categoria, etc.).
        </p>

        <input type="file" accept=".csv,text/csv" onChange={handleArchivo} className="input-base mb-3" />

        <button
          onClick={() => procesar(ejemplo)}
          className="btn-ghost text-sm w-full mb-4"
          disabled={cargando}
        >
          Usar CSV de ejemplo
        </button>

        {cargando && <p className="text-muted text-sm">Procesando...</p>}

        {resultado && (
          <div className="bg-input/40 rounded-lg p-3 text-sm mb-4">
            <p className="text-primary">{resultado.validos} producto(s) importados.</p>
            {resultado.errores.length > 0 && (
              <ul className="mt-2 text-critico/90 text-xs space-y-1">
                {resultado.errores.map((e, i) => <li key={i}>- {e}</li>)}
              </ul>
            )}
          </div>
        )}

        <button onClick={onCerrar} className="btn-primary w-full">Cerrar</button>
      </div>
    </div>
  )
}
export default ImportCSV
