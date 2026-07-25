import { useState, useEffect, useMemo } from 'react'
import { RepositorioVentas } from '../core/services/RepositorioVentas.js'
import { RepositorioInventario } from '../core/services/RepositorioInventario.js'
import { FirestoreGateway } from '../core/persistence/FirestoreGateway.js'
import Loader from '../components/common/Loader.jsx'

function Estadisticas() {
  const [ventas, setVentas] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      const repoVen = new RepositorioVentas()
      const repoInv = new RepositorioInventario(new FirestoreGateway())
      const [listaVen, listaInv] = await Promise.all([
        repoVen.listar(),
        repoInv.listar()
      ])
      setVentas(listaVen)
      setProductos(listaInv)
      setCargando(false)
    }
    cargar()
  }, [])

  const formatMoneda = (val) => `$${Number(val || 0).toLocaleString('es-CO')}`
  const formatFecha = (iso) => new Date(iso).toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  const formatFechaCorta = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })

  // ── Fecha con más ventas ──
  const mejorDiaVentas = useMemo(() => {
    if (ventas.length === 0) return null
    const mapaDias = new Map()
    ventas.forEach(v => {
      const fecha = new Date(v.fechaVenta).toISOString().split('T')[0]
      const actual = mapaDias.get(fecha) || { fecha, totalVentas: 0, cantidadVentas: 0, unidadesTotales: 0 }
      actual.totalVentas += v.totalVenta || 0
      actual.cantidadVentas += 1
      actual.unidadesTotales += v.cantidadVendida || 0
      mapaDias.set(fecha, actual)
    })
    const diasOrdenados = Array.from(mapaDias.values()).sort((a, b) => b.totalVentas - a.totalVentas)
    return diasOrdenados[0] || null
  }, [ventas])

  // ── Producto más vendido y menos vendido ──
  const { productoMasVendido, productoMenosVendido } = useMemo(() => {
    if (ventas.length === 0) return { productoMasVendido: null, productoMenosVendido: null }
    const mapa = new Map()
    ventas.forEach(v => {
      const clave = (v.productoId || v.productoNombre || '').toLowerCase().trim()
      if (!clave) return
      const actual = mapa.get(clave) || {
        productoId: v.productoId,
        nombre: v.productoNombre,
        marca: v.marca || '',
        categoria: v.categoria || '',
        unidadesVendidas: 0,
        totalIngresos: 0,
      }
      actual.unidadesVendidas += Number(v.cantidadVendida) || 0
      actual.totalIngresos += Number(v.totalVenta) || 0
      mapa.set(clave, actual)
    })

    const lista = Array.from(mapa.values()).map(item => {
      const prodInv = productos.find(p => p.id === item.productoId || p.nombre.toLowerCase().trim() === item.nombre.toLowerCase().trim())
      return {
        ...item,
        nombre: prodInv ? prodInv.nombre : item.nombre,
        marca: prodInv ? prodInv.marca : item.marca,
        categoria: prodInv ? prodInv.categoria : item.categoria,
        imagenUrl: prodInv?.imagenUrl || '',
      }
    })

    if (lista.length === 0) return { productoMasVendido: null, productoMenosVendido: null }

    lista.sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)
    return {
      productoMasVendido: lista[0],
      productoMenosVendido: lista[lista.length - 1],
    }
  }, [ventas, productos])

  // ── Categoría más vendida ──
  const categoriaMasVendida = useMemo(() => {
    if (ventas.length === 0) return null
    const mapa = new Map()
    ventas.forEach(v => {
      let cat = v.categoria || 'Sin categoría'
      // Normalizar categoría
      const prodInv = productos.find(p => p.id === v.productoId)
      if (prodInv) cat = prodInv.categoria || cat
      const actual = mapa.get(cat) || { categoria: cat, unidades: 0, ingresos: 0, transacciones: 0 }
      actual.unidades += Number(v.cantidadVendida) || 0
      actual.ingresos += Number(v.totalVenta) || 0
      actual.transacciones += 1
      mapa.set(cat, actual)
    })
    const lista = Array.from(mapa.values()).sort((a, b) => b.unidades - a.unidades)
    return lista[0] || null
  }, [ventas, productos])

  // ── Todas las categorías para gráfico de barras ──
  const categorias = useMemo(() => {
    const mapa = new Map()
    ventas.forEach(v => {
      let cat = v.categoria || 'Sin categoría'
      const prodInv = productos.find(p => p.id === v.productoId)
      if (prodInv) cat = prodInv.categoria || cat
      const actual = mapa.get(cat) || { categoria: cat, unidades: 0, ingresos: 0 }
      actual.unidades += Number(v.cantidadVendida) || 0
      actual.ingresos += Number(v.totalVenta) || 0
      mapa.set(cat, actual)
    })
    return Array.from(mapa.values()).sort((a, b) => b.unidades - a.unidades)
  }, [ventas, productos])

  // ── Ventas por día (últimos 14 días con datos) ──
  const ventasPorDia = useMemo(() => {
    const mapa = new Map()
    ventas.forEach(v => {
      const fecha = new Date(v.fechaVenta).toISOString().split('T')[0]
      const actual = mapa.get(fecha) || { fecha, total: 0, unidades: 0 }
      actual.total += v.totalVenta || 0
      actual.unidades += v.cantidadVendida || 0
      mapa.set(fecha, actual)
    })
    return Array.from(mapa.values())
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(-14)
  }, [ventas])

  const maxVentaDia = useMemo(() => Math.max(...ventasPorDia.map(d => d.total), 1), [ventasPorDia])

  // ── Nombre bonito para categoría ──
  const nombreCategoria = (cat) => {
    const mapa = {
      'rostro': 'Rostro',
      'ojos': 'Ojos',
      'labios': 'Labios',
      'cuidado_piel': 'Cuidado de Piel',
    }
    return mapa[cat] || cat
  }

  const iconoCategoria = (cat) => {
    const mapa = {
      'rostro': 'fa-face-smile-beam',
      'ojos': 'fa-eye',
      'labios': 'fa-lips',
      'cuidado_piel': 'fa-droplet',
    }
    return mapa[cat] || 'fa-tag'
  }

  const colorCategoria = (cat) => {
    const mapa = {
      'rostro': { bg: 'bg-pink-100', text: 'text-pink-600', bar: 'from-pink-400 to-pink-500' },
      'ojos': { bg: 'bg-purple-100', text: 'text-purple-600', bar: 'from-purple-400 to-purple-500' },
      'labios': { bg: 'bg-rose-100', text: 'text-rose-600', bar: 'from-rose-400 to-rose-500' },
      'cuidado_piel': { bg: 'bg-teal-100', text: 'text-teal-600', bar: 'from-teal-400 to-teal-500' },
    }
    return mapa[cat] || { bg: 'bg-slate-100', text: 'text-slate-600', bar: 'from-slate-400 to-slate-500' }
  }

  if (cargando) return <Loader texto="Cargando Estadísticas..." />

  const sinDatos = ventas.length === 0

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-textDark text-2xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-pinkGlow">
            <i className="fa-solid fa-chart-bar"></i>
          </div>
          Estadísticas de Ventas
        </h1>
        <p className="text-textMuted text-sm mt-1">Análisis detallado del rendimiento de ventas de Sweet Glow Cosmetics</p>
      </div>

      {sinDatos ? (
        <div className="card p-12 text-center space-y-4">
          <div className="w-20 h-20 bg-primaryLt text-primary rounded-full flex items-center justify-center mx-auto text-3xl animate-pulse">
            <i className="fa-solid fa-chart-pie"></i>
          </div>
          <h3 className="text-textDark font-bold text-lg">Sin datos de ventas</h3>
          <p className="text-textMuted text-sm max-w-md mx-auto">
            Registra ventas desde la pestaña <strong>Compras & Ventas</strong> para ver las estadísticas aquí. 
            Los datos se actualizan automáticamente.
          </p>
        </div>
      ) : (
        <>
          {/* ── 4 Tarjetas Principales ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* Mejor día de ventas */}
            <div className="card p-5 relative overflow-hidden group hover:shadow-cardHover transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center mb-3 shadow-sm">
                  <i className="fa-solid fa-calendar-star text-amber-600 text-lg"></i>
                </div>
                <p className="text-textMuted text-[10px] font-bold uppercase tracking-widest mb-1">Mejor Día de Ventas</p>
                {mejorDiaVentas ? (
                  <>
                    <p className="text-textDark text-sm font-bold capitalize leading-snug">{formatFecha(mejorDiaVentas.fecha)}</p>
                    <div className="flex gap-3 mt-2.5">
                      <span className="text-[11px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-lg border border-amber-200">
                        {formatMoneda(mejorDiaVentas.totalVentas)}
                      </span>
                      <span className="text-[11px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-lg border border-amber-200">
                        {mejorDiaVentas.unidadesTotales} und.
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-textMuted text-sm">Sin datos</p>
                )}
              </div>
            </div>

            {/* Producto más vendido */}
            <div className="card p-5 relative overflow-hidden group hover:shadow-cardHover transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center mb-3 shadow-sm">
                  <i className="fa-solid fa-arrow-trend-up text-emerald-600 text-lg"></i>
                </div>
                <p className="text-textMuted text-[10px] font-bold uppercase tracking-widest mb-1">Producto Más Vendido</p>
                {productoMasVendido ? (
                  <>
                    <p className="text-textDark text-sm font-bold leading-snug line-clamp-1">{productoMasVendido.nombre}</p>
                    {productoMasVendido.marca && <p className="text-textMuted text-xs">{productoMasVendido.marca}</p>}
                    <div className="flex gap-3 mt-2.5">
                      <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-lg border border-emerald-200">
                        {productoMasVendido.unidadesVendidas} und.
                      </span>
                      <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-lg border border-emerald-200">
                        {formatMoneda(productoMasVendido.totalIngresos)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-textMuted text-sm">Sin datos</p>
                )}
              </div>
            </div>

            {/* Producto menos vendido */}
            <div className="card p-5 relative overflow-hidden group hover:shadow-cardHover transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-100 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center mb-3 shadow-sm">
                  <i className="fa-solid fa-arrow-trend-down text-red-500 text-lg"></i>
                </div>
                <p className="text-textMuted text-[10px] font-bold uppercase tracking-widest mb-1">Producto Menos Vendido</p>
                {productoMenosVendido ? (
                  <>
                    <p className="text-textDark text-sm font-bold leading-snug line-clamp-1">{productoMenosVendido.nombre}</p>
                    {productoMenosVendido.marca && <p className="text-textMuted text-xs">{productoMenosVendido.marca}</p>}
                    <div className="flex gap-3 mt-2.5">
                      <span className="text-[11px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-lg border border-red-200">
                        {productoMenosVendido.unidadesVendidas} und.
                      </span>
                      <span className="text-[11px] bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-lg border border-red-200">
                        {formatMoneda(productoMenosVendido.totalIngresos)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-textMuted text-sm">Sin datos</p>
                )}
              </div>
            </div>

            {/* Categoría más vendida */}
            <div className="card p-5 relative overflow-hidden group hover:shadow-cardHover transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center mb-3 shadow-sm">
                  <i className="fa-solid fa-crown text-purple-600 text-lg"></i>
                </div>
                <p className="text-textMuted text-[10px] font-bold uppercase tracking-widest mb-1">Categoría Más Vendida</p>
                {categoriaMasVendida ? (
                  <>
                    <p className="text-textDark text-sm font-bold leading-snug">{nombreCategoria(categoriaMasVendida.categoria)}</p>
                    <div className="flex gap-3 mt-2.5">
                      <span className="text-[11px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-lg border border-purple-200">
                        {categoriaMasVendida.unidades} und.
                      </span>
                      <span className="text-[11px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-lg border border-purple-200">
                        {categoriaMasVendida.transacciones} ventas
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-textMuted text-sm">Sin datos</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Gráfico de Ventas por Día + Categorías ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Gráfico de barras - Ventas por Día */}
            <div className="xl:col-span-2 card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primaryLt text-primary flex items-center justify-center font-bold text-sm">
                  <i className="fa-solid fa-chart-column"></i>
                </div>
                <div>
                  <h2 className="text-textDark font-bold text-base">Ventas por Día</h2>
                  <p className="text-textMuted text-[11px]">Últimos {ventasPorDia.length} días con actividad</p>
                </div>
              </div>

              {ventasPorDia.length === 0 ? (
                <p className="text-textMuted text-sm text-center py-8">Sin datos de ventas por día.</p>
              ) : (
                <div className="flex items-end gap-1.5 h-52">
                  {ventasPorDia.map((dia, i) => {
                    const pct = (dia.total / maxVentaDia) * 100
                    const esMejor = mejorDiaVentas && dia.fecha === mejorDiaVentas.fecha
                    return (
                      <div key={dia.fecha} className="flex-1 flex flex-col items-center gap-1 group" title={`${formatFechaCorta(dia.fecha)}: ${formatMoneda(dia.total)} (${dia.unidades} und.)`}>
                        {/* Tooltip al hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-textDark font-bold bg-white border border-border shadow-md rounded-lg px-2 py-1 whitespace-nowrap pointer-events-none -mt-1 mb-1">
                          {formatMoneda(dia.total)}
                        </div>
                        {/* Barra */}
                        <div className="w-full flex items-end justify-center" style={{ height: '160px' }}>
                          <div
                            className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ease-out ${
                              esMejor 
                                ? 'bg-gradient-to-t from-amber-400 to-amber-300 shadow-md shadow-amber-200' 
                                : 'bg-gradient-to-t from-primary to-pink-300 group-hover:from-primaryHover group-hover:to-primary'
                            }`}
                            style={{
                              height: `${Math.max(pct, 4)}%`,
                              animationDelay: `${i * 60}ms`,
                            }}
                          ></div>
                        </div>
                        {/* Label */}
                        <span className="text-[9px] text-textMuted font-medium mt-0.5 whitespace-nowrap">{formatFechaCorta(dia.fecha)}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {mejorDiaVentas && (
                <div className="mt-4 flex items-center gap-2 text-[11px] text-textMuted">
                  <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-amber-400 to-amber-300 inline-block"></span>
                  Día con mayores ventas
                  <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-primary to-pink-300 inline-block ml-3"></span>
                  Otros días
                </div>
              )}
            </div>

            {/* Desglose por Categoría */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                  <i className="fa-solid fa-layer-group"></i>
                </div>
                <div>
                  <h2 className="text-textDark font-bold text-base">Ventas por Categoría</h2>
                  <p className="text-textMuted text-[11px]">Desglose por tipo de producto</p>
                </div>
              </div>

              {categorias.length === 0 ? (
                <p className="text-textMuted text-sm text-center py-8">Sin datos.</p>
              ) : (
                <div className="space-y-5">
                  {categorias.map((cat, i) => {
                    const maxUnidades = categorias[0].unidades
                    const pct = maxUnidades > 0 ? (cat.unidades / maxUnidades) * 100 : 0
                    const color = colorCategoria(cat.categoria)
                    return (
                      <div key={cat.categoria} className="group">
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg ${color.bg} ${color.text} flex items-center justify-center text-xs`}>
                              <i className={`fa-solid ${iconoCategoria(cat.categoria)}`}></i>
                            </div>
                            <span className="text-textDark text-sm font-bold">{nombreCategoria(cat.categoria)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-textDark font-extrabold text-sm">{cat.unidades}</span>
                            <span className="text-textMuted text-xs ml-1">und.</span>
                          </div>
                        </div>
                        {/* Barra de progreso */}
                        <div className="w-full h-2.5 bg-inputBg rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${color.bar} transition-all duration-700 ease-out`}
                            style={{ 
                              width: `${pct}%`,
                              animationDelay: `${i * 100}ms`,
                            }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-textMuted mt-1">
                          Ingresos: <span className="font-bold text-textDark">{formatMoneda(cat.ingresos)}</span>
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Tabla de detalle: Productos más y menos vendidos ── */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                <i className="fa-solid fa-ranking-star"></i>
              </div>
              <div>
                <h2 className="text-textDark font-bold text-base">Ranking Completo de Productos</h2>
                <p className="text-textMuted text-[11px]">Todos los productos vendidos ordenados por volumen</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-inputBg text-textMuted text-xs font-semibold uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="px-5 py-3 text-center w-12">#</th>
                    <th className="px-5 py-3">Producto</th>
                    <th className="px-5 py-3">Categoría</th>
                    <th className="px-5 py-3 text-center">Unidades Vendidas</th>
                    <th className="px-5 py-3 text-right">Ingresos Totales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(() => {
                    const mapa = new Map()
                    ventas.forEach(v => {
                      const clave = (v.productoId || v.productoNombre || '').toLowerCase().trim()
                      if (!clave) return
                      const actual = mapa.get(clave) || {
                        productoId: v.productoId,
                        nombre: v.productoNombre,
                        marca: v.marca || '',
                        categoria: v.categoria || '',
                        unidadesVendidas: 0,
                        totalIngresos: 0,
                      }
                      actual.unidadesVendidas += Number(v.cantidadVendida) || 0
                      actual.totalIngresos += Number(v.totalVenta) || 0
                      mapa.set(clave, actual)
                    })
                    const lista = Array.from(mapa.values()).map(item => {
                      const prodInv = productos.find(p => p.id === item.productoId || p.nombre.toLowerCase().trim() === item.nombre.toLowerCase().trim())
                      return {
                        ...item,
                        nombre: prodInv ? prodInv.nombre : item.nombre,
                        marca: prodInv ? prodInv.marca : item.marca,
                        categoria: prodInv ? prodInv.categoria : item.categoria,
                      }
                    })
                    lista.sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)

                    if (lista.length === 0) {
                      return <tr><td colSpan="5" className="px-5 py-8 text-center text-textMuted">Sin datos de productos.</td></tr>
                    }

                    return lista.map((prod, index) => {
                      const rank = index + 1
                      let rankBadge = 'bg-slate-100 text-slate-600'
                      if (rank === 1) rankBadge = 'bg-amber-400 text-white'
                      else if (rank === 2) rankBadge = 'bg-slate-300 text-white'
                      else if (rank === 3) rankBadge = 'bg-rose-300 text-white'
                      const esUltimo = index === lista.length - 1 && lista.length > 1

                      return (
                        <tr key={prod.productoId || prod.nombre + index} className={`hover:bg-primaryLt/20 transition-colors ${esUltimo ? 'bg-red-50/40' : ''}`}>
                          <td className="px-5 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-extrabold ${rankBadge}`}>
                              {rank}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <p className="font-bold text-textDark">{prod.nombre}</p>
                            {prod.marca && <p className="text-xs text-textMuted">{prod.marca}</p>}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${colorCategoria(prod.categoria).bg} ${colorCategoria(prod.categoria).text}`}>
                              <i className={`fa-solid ${iconoCategoria(prod.categoria)} text-[10px]`}></i>
                              {nombreCategoria(prod.categoria)}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`font-extrabold ${rank === 1 ? 'text-emerald-600' : esUltimo ? 'text-red-500' : 'text-textDark'}`}>
                              {prod.unidadesVendidas} und.
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-textDark">{formatMoneda(prod.totalIngresos)}</td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Estadisticas
