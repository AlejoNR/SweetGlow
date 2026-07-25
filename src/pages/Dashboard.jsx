import { useState, useEffect, useMemo } from 'react'
import { FirestoreGateway } from '../core/persistence/FirestoreGateway.js'
import { RepositorioInventario } from '../core/services/RepositorioInventario.js'
import { RepositorioVentas } from '../core/services/RepositorioVentas.js'
import Loader from '../components/common/Loader.jsx'

function Dashboard() {
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      const repoInv = new RepositorioInventario(new FirestoreGateway())
      const repoVen = new RepositorioVentas()

      const [listaInv, listaVen] = await Promise.all([
        repoInv.listar(),
        repoVen.listar()
      ])

      setProductos(listaInv)
      setVentas(listaVen)
      setCargando(false)
    }
    cargar()
  }, [])

  const valorTotalInventario = useMemo(() => {
    return productos.reduce((acc, p) => acc + (p.precioVenta * p.cantidad), 0)
  }, [productos])
  
  const inversionTotal = useMemo(() => {
    return productos.reduce((acc, p) => acc + (p.precioCompra * p.cantidad), 0)
  }, [productos])

  const totalVentasRegistradas = useMemo(() => {
    return ventas.reduce((acc, v) => acc + (v.totalVenta || 0), 0)
  }, [ventas])

  // Top 10 Productos Más Vendidos
  const top10Vendidos = useMemo(() => {
    const mapa = new Map()

    ventas.forEach(v => {
      const clave = (v.productoId || v.productoNombre || '').toLowerCase().trim()
      if (!clave) return

      const actual = mapa.get(clave) || {
        productoId: v.productoId,
        nombre: v.productoNombre,
        marca: v.marca || '',
        categoria: v.categoria || 'generico',
        unidadesVendidas: 0,
        totalIngresos: 0,
      }
      actual.unidadesVendidas += Number(v.cantidadVendida) || 0
      actual.totalIngresos += Number(v.totalVenta) || 0
      mapa.set(clave, actual)
    })

    return Array.from(mapa.values())
      .map(item => {
        const prodInv = productos.find(p => p.id === item.productoId || p.nombre.toLowerCase().trim() === item.nombre.toLowerCase().trim())
        return {
          ...item,
          nombre: prodInv ? prodInv.nombre : item.nombre,
          marca: prodInv ? prodInv.marca : item.marca,
          categoria: prodInv ? prodInv.categoria : item.categoria,
          imagenUrl: prodInv?.imagenUrl || '',
          stockActual: prodInv ? prodInv.cantidad : 0,
          precioVenta: prodInv ? prodInv.precioVenta : (item.totalIngresos / (item.unidadesVendidas || 1)),
        }
      })
      .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)
      .slice(0, 10)
  }, [ventas, productos])

  const formatMoneda = (val) => `$${Number(val || 0).toLocaleString('es-CO')}`

  if (cargando) return <Loader texto="Cargando Dashboard..." />

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-textDark text-2xl font-bold">Dashboard</h1>
        <p className="text-textMuted text-sm">Resumen general y productos estrella de Sweet Glow Cosmetics</p>
      </div>

      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-primaryLt flex items-center justify-center mb-3">
             <i className="fa-solid fa-box-open text-primary"></i>
          </div>
          <p className="text-textMuted text-xs font-semibold uppercase tracking-wider">Productos en Catálogo</p>
          <p className="text-textDark text-3xl font-bold mt-1">{productos.length}</p>
        </div>
        
        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
             <i className="fa-solid fa-coins text-purple-600"></i>
          </div>
          <p className="text-textMuted text-xs font-semibold uppercase tracking-wider">Inversión en Inventario Actual</p>
          <p className="text-textDark text-2xl font-bold mt-1">{formatMoneda(inversionTotal)}</p>
        </div>

        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
             <i className="fa-solid fa-chart-line text-emerald-600"></i>
          </div>
          <p className="text-textMuted text-xs font-semibold uppercase tracking-wider">Ventas Totales Registradas</p>
          <p className="text-textDark text-2xl font-bold mt-1">{formatMoneda(totalVentasRegistradas)}</p>
        </div>
      </div>

      {/* Sección Top 10 Más Vendidos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-base shadow-sm">
              <i className="fa-solid fa-trophy"></i>
            </div>
            <div>
              <h2 className="text-textDark font-bold text-lg">Top 10 Productos Más Vendidos</h2>
              <p className="text-textMuted text-xs">Ranking por volumen de unidades vendidas</p>
            </div>
          </div>
          {top10Vendidos.length > 0 && (
            <span className="text-xs bg-primaryLt text-primary font-bold px-3 py-1 rounded-full border border-primary/20">
              {top10Vendidos.length} productos destacados
            </span>
          )}
        </div>

        {top10Vendidos.length === 0 ? (
          <div className="card p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-primaryLt text-primary rounded-full flex items-center justify-center mx-auto text-2xl">
              <i className="fa-solid fa-basket-shopping"></i>
            </div>
            <h3 className="text-textDark font-bold">Sin ventas registradas aún</h3>
            <p className="text-textMuted text-sm max-w-md mx-auto">
              Registra ventas manualmente desde la pestaña <strong>Compras & Ventas</strong> o importa tu inventario desde Excel para ver el top 10 aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {top10Vendidos.map((prod, index) => {
              const rank = index + 1
              let rankStyle = "bg-slate-100 text-slate-700 border-slate-200"
              let rankIcon = null

              if (rank === 1) {
                rankStyle = "bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md shadow-amber-200 border-amber-300"
                rankIcon = <i className="fa-solid fa-crown mr-1"></i>
              } else if (rank === 2) {
                rankStyle = "bg-gradient-to-r from-slate-300 to-slate-400 text-white border-slate-300"
              } else if (rank === 3) {
                rankStyle = "bg-gradient-to-r from-rose-300 to-rose-400 text-white border-rose-300"
              }

              return (
                <div 
                  key={prod.productoId || prod.nombre + index} 
                  className="card p-4 flex flex-col justify-between hover:shadow-cardHover transition-all duration-200 border-border relative overflow-hidden group"
                >
                  {/* Badge de Ranking */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border flex items-center ${rankStyle}`}>
                      {rankIcon}#{rank}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-inputBg text-textMuted border border-border">
                      {prod.categoria}
                    </span>
                  </div>

                  {/* Imagen o Thumbnail */}
                  <div className="w-full h-32 bg-inputBg rounded-xl overflow-hidden mb-3 flex items-center justify-center border border-border/50 group-hover:scale-[1.02] transition-transform duration-200">
                    {prod.imagenUrl ? (
                      <img src={prod.imagenUrl} alt={prod.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <i className="fa-solid fa-wand-magic-sparkles text-3xl text-primary/40 mb-1 block"></i>
                        <span className="text-[10px] text-textMuted font-medium">Sweet Glow</span>
                      </div>
                    )}
                  </div>

                  {/* Info Producto */}
                  <div className="space-y-1 mb-4 flex-1">
                    <h3 className="font-bold text-textDark text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors" title={prod.nombre}>
                      {prod.nombre}
                    </h3>
                    {prod.marca && (
                      <p className="text-xs text-textMuted font-medium">{prod.marca}</p>
                    )}
                  </div>

                  {/* Estadísticas de Ventas */}
                  <div className="space-y-2 border-t border-border pt-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-textMuted font-medium">Vendidos:</span>
                      <span className="font-extrabold text-primary bg-primaryLt px-2 py-0.5 rounded-md">
                        {prod.unidadesVendidas} und.
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-textMuted font-medium">Venta Neta:</span>
                      <span className="font-extrabold text-emerald-600">
                        {formatMoneda(prod.totalIngresos)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-textMuted pt-1 border-t border-border/40">
                      <span>Stock actual:</span>
                      <span className={`font-bold ${prod.stockActual <= 2 ? 'text-amber-600 font-extrabold' : 'text-textDark'}`}>
                        {prod.stockActual} und.
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
