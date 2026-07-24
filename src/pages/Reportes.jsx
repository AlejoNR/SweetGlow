import { useState, useMemo, useRef, useEffect } from 'react'
import { MotorFEFO } from '../core/services/MotorFEFO.js'
import { RepositorioInventario } from '../core/services/RepositorioInventario.js'
import { LocalStorageGateway } from '../core/persistence/LocalStorageGateway.js'
import Loader from '../components/common/Loader.jsx'

// Colores por estado para usar tanto en UI como en PDF
const COLORES = {
  critico:    { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    hex: '#ef4444' },
  urgente:    { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400', hex: '#f97316' },
  preventivo: { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  hex: '#f59e0b' },
  fresco:     { bg: 'bg-emerald-50',text: 'text-emerald-700',dot: 'bg-emerald-500',hex: '#10b981' },
}
const LABELS = { critico: 'Crítico', urgente: 'Urgente', preventivo: 'Preventivo', fresco: 'Fresco' }

function porcentaje(parte, total) {
  if (!total) return 0
  return ((parte / total) * 100).toFixed(1)
}

function agruparVolumen(lista) {
  const mapa = {}
  lista.forEach((a) => {
    const u = (a.unidad || 'und').toLowerCase()
    mapa[u] = (mapa[u] || 0) + Number(a.cantidad || 0)
  })
  return mapa
}

// Barra de progreso de colores
function BarraDistribucion({ grupos, total }) {
  if (!total) return null
  const orden = ['critico', 'urgente', 'preventivo', 'fresco']
  return (
    <div className="flex h-3 rounded-full overflow-hidden w-full gap-px">
      {orden.map((estado) => {
        const pct = porcentaje(grupos[estado].length, total)
        if (pct <= 0) return null
        return (
          <div
            key={estado}
            style={{ width: `${pct}%`, backgroundColor: COLORES[estado].hex }}
            title={`${LABELS[estado]}: ${pct}%`}
          />
        )
      })}
    </div>
  )
}

// Tarjeta de resumen
function TarjetaEstado({ estado, cantidad, total, volumen }) {
  const c = COLORES[estado]
  return (
    <div className={`rounded-xl p-4 ${c.bg} border border-current/10`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
        <span className={`text-xs font-bold uppercase tracking-widest ${c.text}`}>{LABELS[estado]}</span>
      </div>
      <p className={`text-3xl font-bold ${c.text}`}>{cantidad}</p>
      <p className="text-xs text-gray-400 mt-1">{porcentaje(cantidad, total)}% del inventario</p>
      {volumen && Object.keys(volumen).length > 0 && (
        <div className="mt-2 pt-2 border-t border-current/10">
          <p className="text-[10px] font-semibold text-gray-500 mb-1">Volumen:</p>
          {Object.entries(volumen).map(([u, v]) => (
            <p key={u} className={`text-xs font-bold ${c.text}`}>{v.toFixed(2)} {u}</p>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Reportes() {
  const reporteRef = useRef(null)

  const [alimentos, setAlimentos] = useState([])
  const [cargando, setCargando] = useState(true)

  // --- Filtros ---
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [generandoPDF, setGenerandoPDF] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      const repo = new RepositorioInventario(new LocalStorageGateway())
      const lista = await repo.listar()
      setAlimentos(lista)
      setCargando(false)
    }
    cargar()
  }, [])

  const categorias = useMemo(() => {
    const cats = [...new Set(alimentos.map((a) => a.categoria))]
    return ['todas', ...cats]
  }, [alimentos])

  // Aplicar filtros
  const alimentosFiltrados = useMemo(() => {
    return alimentos.filter((a) => {
      if (categoriaFiltro !== 'todas' && a.categoria !== categoriaFiltro) return false
      if (fechaDesde) {
        const desde = new Date(fechaDesde)
        if (new Date(a.fechaCaducidad) < desde) return false
      }
      if (fechaHasta) {
        const hasta = new Date(fechaHasta)
        hasta.setHours(23, 59, 59)
        if (new Date(a.fechaCaducidad) > hasta) return false
      }
      return true
    })
  }, [alimentos, categoriaFiltro, fechaDesde, fechaHasta])

  const grupos = useMemo(() => MotorFEFO.clasificar(alimentosFiltrados), [alimentosFiltrados])
  const total = alimentosFiltrados.length
  const volumenCritico = useMemo(() => agruparVolumen(grupos.critico), [grupos])

  const handleDescargarPDF = async () => {
    setGenerandoPDF(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      const elemento = reporteRef.current
      const canvas = await html2canvas(elemento, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      // Si el contenido es mayor que una página, lo dividimos
      const pageHeight = pdf.internal.pageSize.getHeight()
      let posY = 0
      while (posY < pdfHeight) {
        if (posY > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -posY, pdfWidth, pdfHeight)
        posY += pageHeight
      }

      const fecha = new Date().toLocaleDateString('es-ES').replace(/\//g, '-')
      pdf.save(`reporte-FEFO-${fecha}.pdf`)
    } catch (err) {
      console.error('Error generando PDF:', err)
      alert('Error al generar el PDF. Intenta de nuevo.')
    } finally {
      setGenerandoPDF(false)
    }
  }

  if (cargando) return <Loader texto="Cargando reporte..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-textDark text-2xl font-bold">Reporte Analítico FEFO</h1>
          <p className="text-textMuted text-sm">
            {total} productos en inventario • Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={handleDescargarPDF}
          disabled={generandoPDF}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 shadow-sm"
        >
          {generandoPDF ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
              Generando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar PDF
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filtros */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Categoría</label>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
            >
              {categorias.map((c) => (
                <option key={c} value={c} className="capitalize">{c === 'todas' ? 'Todas las categorías' : c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Vence desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Vence hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {(categoriaFiltro !== 'todas' || fechaDesde || fechaHasta) && (
            <button
              onClick={() => { setCategoriaFiltro('todas'); setFechaDesde(''); setFechaHasta('') }}
              className="px-3 py-2 text-xs text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg bg-white hover:border-red-200 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Contenido del reporte (esto es lo que se captura para PDF) */}
        <div ref={reporteRef} className="bg-white">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">SIGI — FreshControl · Reporte FEFO</p>
            <p className="text-xs text-gray-400">{new Date().toLocaleString('es-ES')}{categoriaFiltro !== 'todas' ? ` · Categoría: ${categoriaFiltro}` : ''}{fechaDesde ? ` · Desde: ${fechaDesde}` : ''}{fechaHasta ? ` · Hasta: ${fechaHasta}` : ''}</p>
          </div>

          {/* Tarjetas de resumen */}
          <div className="px-6 pt-5 pb-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Distribución por Estado</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {['critico', 'urgente', 'preventivo', 'fresco'].map((estado) => (
                <TarjetaEstado
                  key={estado}
                  estado={estado}
                  cantidad={grupos[estado].length}
                  total={total}
                  volumen={estado === 'critico' ? volumenCritico : null}
                />
              ))}
            </div>
            {/* Barra visual de distribución */}
            <BarraDistribucion grupos={grupos} total={total} />
            <div className="flex gap-4 mt-2">
              {['critico', 'urgente', 'preventivo', 'fresco'].map((estado) => (
                <div key={estado} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORES[estado].hex }} />
                  <span className="text-[10px] text-gray-400">{LABELS[estado]} ({porcentaje(grupos[estado].length, total)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Volumen Crítico */}
          {grupos.critico.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Volumen en Estado Crítico</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(volumenCritico).map(([unidad, volumen]) => (
                  <div key={unidad} className="flex items-baseline gap-1.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <span className="text-2xl font-bold text-red-700">{volumen.toFixed(2)}</span>
                    <span className="text-sm font-semibold text-red-500">{unidad}</span>
                    <span className="text-xs text-red-400 ml-1">({porcentaje(volumen, alimentos.reduce((s, a) => (a.unidad?.toLowerCase() === unidad ? s + Number(a.cantidad) : s), 0))}% del total en esa unidad)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de críticos */}
          {grupos.critico.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                Detalle de Productos Críticos
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-bold">{grupos.critico.length}</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-red-100">
                <table className="w-full text-sm">
                  <thead className="bg-red-50">
                    <tr className="text-red-600 text-[10px] uppercase tracking-widest">
                      <th className="py-2.5 px-4 text-left font-bold">Nombre</th>
                      <th className="py-2.5 px-4 text-left font-bold">Lote</th>
                      <th className="py-2.5 px-4 text-left font-bold">Categoría</th>
                      <th className="py-2.5 px-4 text-left font-bold">Cantidad</th>
                      <th className="py-2.5 px-4 text-left font-bold">Vence</th>
                      <th className="py-2.5 px-4 text-left font-bold">Horas restantes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupos.critico.map((a, i) => {
                      const horas = Math.round(a.horasParaCaducar())
                      return (
                        <tr key={a.id} className={i % 2 === 0 ? 'bg-white' : 'bg-red-50/40'}>
                          <td className="py-2.5 px-4 font-semibold text-gray-800">{a.nombre}</td>
                          <td className="py-2.5 px-4 text-gray-500 font-mono text-xs">{a.lote || '—'}</td>
                          <td className="py-2.5 px-4 text-gray-500 capitalize">{a.categoria}</td>
                          <td className="py-2.5 px-4 text-gray-700 font-medium">{a.cantidad} {a.unidad}</td>
                          <td className="py-2.5 px-4 text-gray-500 text-xs">{new Date(a.fechaCaducidad).toLocaleDateString('es-ES')}</td>
                          <td className="py-2.5 px-4">
                            <span className={`text-xs font-bold ${horas <= 0 ? 'text-red-700' : horas < 24 ? 'text-red-600' : 'text-orange-600'}`}>
                              {horas <= 0 ? 'VENCIDO' : `${horas}h`}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inventario general filtrado */}
          <div className="px-6 py-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Inventario Completo (filtrado)</h3>
            {alimentosFiltrados.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">No hay productos con los filtros seleccionados.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr className="text-gray-400 text-[10px] uppercase tracking-widest">
                      <th className="py-2.5 px-3 text-left font-bold">Nombre</th>
                      <th className="py-2.5 px-3 text-left font-bold">Lote</th>
                      <th className="py-2.5 px-3 text-left font-bold">Categoría</th>
                      <th className="py-2.5 px-3 text-left font-bold">Cantidad</th>
                      <th className="py-2.5 px-3 text-left font-bold">Vence</th>
                      <th className="py-2.5 px-3 text-left font-bold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MotorFEFO.ordenar(alimentosFiltrados).map((a, i) => {
                      const estado = a.estadoCaducidad()
                      return (
                        <tr key={a.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                          <td className="py-2 px-3 font-semibold text-gray-800">{a.nombre}</td>
                          <td className="py-2 px-3 text-gray-400 font-mono">{a.lote || '—'}</td>
                          <td className="py-2 px-3 text-gray-500 capitalize">{a.categoria}</td>
                          <td className="py-2 px-3 text-gray-700">{a.cantidad} {a.unidad}</td>
                          <td className="py-2 px-3 text-gray-400">{new Date(a.fechaCaducidad).toLocaleDateString('es-ES')}</td>
                          <td className="py-2 px-3">
                            <span className="text-[10px] font-bold uppercase" style={{ color: COLORES[estado].hex }}>
                              {LABELS[estado]}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer del reporte */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400 text-center">
              Reporte generado por SIGI — FreshControl · Estrategia FEFO (First Expired, First Out)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
