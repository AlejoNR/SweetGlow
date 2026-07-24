import { useState, useEffect } from 'react'
import { LocalStorageGateway } from '../core/persistence/LocalStorageGateway.js'
import { RepositorioInventario } from '../core/services/RepositorioInventario.js'
import Loader from '../components/common/Loader.jsx'

function Lotes() {
  const [lotes, setLotes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const repo = new RepositorioInventario(new LocalStorageGateway())
      const alimentos = await repo.listar()

      // Agrupar por lote
      const agrupados = {}
      for (const a of alimentos) {
        const nombreLote = a.lote || 'Sin Lote'
        if (!agrupados[nombreLote]) {
          agrupados[nombreLote] = {
            id: nombreLote,
            nombre: nombreLote,
            alimentos: [],
            masaTotal: 0, // en kg
            volumenTotal: 0, // en L
            unidadesTotal: 0, // en und
            otros: [], // para unidades desconocidas
            sumTiempos: 0
          }
        }
        
        const loteAct = agrupados[nombreLote]
        loteAct.alimentos.push(a.nombre)
        
        const q = Number(a.cantidad) || 0
        const u = String(a.unidad || '').toLowerCase().trim()
        
        // Conversiones base
        if (u === 'kg') loteAct.masaTotal += q
        else if (u === 'g') loteAct.masaTotal += (q / 1000)
        else if (u === 'l' || u === 'litros' || u === 'litro') loteAct.volumenTotal += q
        else if (u === 'ml') loteAct.volumenTotal += (q / 1000)
        else if (u === 'und' || u === 'unidad' || u === 'unidades') loteAct.unidadesTotal += q
        else loteAct.otros.push(`${q} ${a.unidad}`)
        
        if (a.fechaCaducidad) {
          loteAct.sumTiempos += new Date(a.fechaCaducidad).getTime()
        }
      }

      const listaLotes = Object.values(agrupados).map(l => {
        // Promedio de fechas
        const avgTime = l.sumTiempos / l.alimentos.length
        const fechaPromedio = avgTime ? new Date(avgTime).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'
        
        // Remove duplicate food names
        const nombresUnicos = [...new Set(l.alimentos)].join(', ')
        
        // Formatear el texto de cantidades (X kg, Y L)
        const partesCantidad = []
        if (l.masaTotal > 0) partesCantidad.push(`${Number(l.masaTotal.toFixed(3))} kg`)
        if (l.volumenTotal > 0) partesCantidad.push(`${Number(l.volumenTotal.toFixed(3))} L`)
        if (l.unidadesTotal > 0) partesCantidad.push(`${l.unidadesTotal} und`)
        if (l.otros.length > 0) partesCantidad.push(...l.otros)
        
        const textoCantidades = partesCantidad.length > 0 ? partesCantidad.join(', ') : '0'

        return {
          ...l,
          fechaPromedio,
          nombresUnicos,
          textoCantidades
        }
      })

      // Ordenar alfabéticamente
      listaLotes.sort((a, b) => a.nombre.localeCompare(b.nombre))

      setLotes(listaLotes)
      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) return <Loader texto="Cargando lotes..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <i className="fa-solid fa-layer-group text-primary text-xl"></i>
        <h1 className="text-primary font-bold text-lg">Agrupación por Lotes</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lotes.map(lote => (
          <div key={lote.id} className="card p-5 border border-border hover:shadow-lg transition-shadow bg-white">
            <div className="flex justify-between items-start mb-4 border-b border-border pb-3">
              <h3 className="font-bold text-lg text-textDark flex items-center gap-2">
                <i className="fa-solid fa-box text-primary/70"></i>
                {lote.nombre}
              </h3>
              <span className="px-2.5 py-1 bg-primaryLt text-primary text-xs font-bold rounded-full">
                {lote.textoCantidades}
              </span>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-textMuted text-[10px] uppercase tracking-wider font-semibold mb-1">Contenido del Lote</p>
                <p className="text-textDark font-medium line-clamp-2 leading-tight" title={lote.nombresUnicos}>
                  {lote.nombresUnicos}
                </p>
              </div>
              
              <div>
                <p className="text-textMuted text-[10px] uppercase tracking-wider font-semibold mb-1">Caducidad Promedio</p>
                <p className="text-textDark font-mono flex items-center gap-2 text-xs">
                  <i className="fa-regular fa-calendar text-textMuted"></i>
                  {lote.fechaPromedio}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {lotes.length === 0 && (
          <div className="col-span-full py-12 text-center text-textMuted bg-white rounded-xl border border-border">
            No hay lotes registrados en el inventario.
          </div>
        )}
      </div>
    </div>
  )
}
export default Lotes
