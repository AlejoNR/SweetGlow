import { useState, useEffect, useMemo } from 'react'
import { RepositorioCompras } from '../../core/services/RepositorioCompras.js'
import { RepositorioVentas } from '../../core/services/RepositorioVentas.js'

function ProductDetailModal({ producto, onCerrar }) {
  const [compras, setCompras] = useState([])
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      const repoC = new RepositorioCompras()
      const repoV = new RepositorioVentas()

      const [listaC, listaV] = await Promise.all([
        repoC.listar(),
        repoV.listar()
      ])

      // Filtrar por este producto
      const nombreLower = producto.nombre.toLowerCase().trim()
      setCompras(listaC.filter(c =>
        c.productoId === producto.id || c.productoNombre?.toLowerCase().trim() === nombreLower
      ))
      setVentas(listaV.filter(v =>
        v.productoId === producto.id || v.productoNombre?.toLowerCase().trim() === nombreLower
      ))
      setCargando(false)
    }
    cargar()
  }, [producto])

  const totalUnidadesCompradas = useMemo(() => compras.reduce((acc, c) => acc + c.cantidad, 0), [compras])
  const totalUnidadesVendidas = useMemo(() => ventas.reduce((acc, v) => acc + v.cantidadVendida, 0), [ventas])
  const totalInvertido = useMemo(() => compras.reduce((acc, c) => acc + c.totalInversion, 0), [compras])
  const totalVendido = useMemo(() => ventas.reduce((acc, v) => acc + v.totalVenta, 0), [ventas])

  const formatMoneda = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`
  const formatFecha = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50" onClick={onCerrar}>
      <div className="card p-0 w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-border bg-primaryLt/30 flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-white border border-border overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
            {producto.imagenUrl ? (
              <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
            ) : (
              <i className="fa-solid fa-wand-magic-sparkles text-2xl text-primary/30"></i>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-textDark font-bold text-lg leading-tight">{producto.nombre}</h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-textMuted font-medium">
              {producto.marca && <span>{producto.marca}</span>}
              <span className="bg-primaryLt text-primary px-2 py-0.5 rounded-full font-bold capitalize">{producto.categoria}</span>
            </div>
          </div>
          <button onClick={onCerrar} className="text-textMuted hover:text-textDark transition-colors p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Stats actuales */}
        <div className="grid grid-cols-4 divide-x divide-border border-b border-border bg-white">
          <div className="p-4 text-center">
            <p className="text-[10px] text-textMuted font-bold uppercase tracking-wider">Stock</p>
            <p className="text-textDark text-xl font-extrabold mt-0.5">{producto.cantidad}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] text-textMuted font-bold uppercase tracking-wider">Precio Compra</p>
            <p className="text-textDark text-lg font-bold mt-0.5">{formatMoneda(producto.precioCompra)}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] text-textMuted font-bold uppercase tracking-wider">Ganancia</p>
            <p className="text-primary text-lg font-bold mt-0.5">{producto.porcentajeGanancia}%</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] text-textMuted font-bold uppercase tracking-wider">Precio Venta</p>
            <p className="text-emerald-600 text-lg font-extrabold mt-0.5">{formatMoneda(producto.precioVenta)}</p>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto max-h-[45vh] p-6 space-y-6">
          {cargando ? (
            <p className="text-textMuted text-sm text-center py-8">Cargando historial...</p>
          ) : (
            <>
              {/* Resumen rápido */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                  <p className="text-[10px] text-purple-600 font-bold uppercase">Total Comprado</p>
                  <p className="text-purple-800 font-extrabold text-lg">{totalUnidadesCompradas} und.</p>
                  <p className="text-purple-600 text-xs font-semibold">Invertido: {formatMoneda(totalInvertido)}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Total Vendido</p>
                  <p className="text-emerald-800 font-extrabold text-lg">{totalUnidadesVendidas} und.</p>
                  <p className="text-emerald-600 text-xs font-semibold">Ingresos: {formatMoneda(totalVendido)}</p>
                </div>
              </div>

              {/* Historial de Compras / Precios */}
              <div>
                <h3 className="text-textDark font-bold text-sm flex items-center gap-2 mb-3">
                  <i className="fa-solid fa-clock-rotate-left text-primary"></i>
                  Historial de Precios de Compra
                </h3>
                {compras.length === 0 ? (
                  <p className="text-textMuted text-xs bg-inputBg rounded-xl p-4 text-center">Sin registros de compra para este producto.</p>
                ) : (
                  <div className="space-y-2">
                    {compras.map((c, i) => (
                      <div key={c.id || i} className="flex items-center justify-between bg-inputBg rounded-xl px-4 py-3 border border-border/50 hover:bg-primaryLt/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                            +{c.cantidad}
                          </div>
                          <div>
                            <p className="text-textDark text-sm font-semibold">
                              {formatMoneda(c.precioCompra)} <span className="text-textMuted font-normal">c/u</span>
                            </p>
                            <p className="text-textMuted text-[10px] font-medium">{formatFecha(c.fechaCompra)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-600 text-xs font-bold">Venta: {formatMoneda(c.precioVenta)}</p>
                          <p className="text-textMuted text-[10px]">Ganancia: {c.porcentajeGanancia}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Historial de Ventas */}
              {ventas.length > 0 && (
                <div>
                  <h3 className="text-textDark font-bold text-sm flex items-center gap-2 mb-3">
                    <i className="fa-solid fa-receipt text-emerald-600"></i>
                    Historial de Ventas
                  </h3>
                  <div className="space-y-2">
                    {ventas.map((v, i) => (
                      <div key={v.id || i} className="flex items-center justify-between bg-inputBg rounded-xl px-4 py-3 border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                            -{v.cantidadVendida}
                          </div>
                          <div>
                            <p className="text-textDark text-sm font-semibold">
                              {formatMoneda(v.precioVenta)} <span className="text-textMuted font-normal">c/u</span>
                            </p>
                            <p className="text-textMuted text-[10px] font-medium">{formatFecha(v.fechaVenta)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-600 text-sm font-extrabold">{formatMoneda(v.totalVenta)}</p>
                          {v.nota && <p className="text-textMuted text-[10px]">{v.nota}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export default ProductDetailModal
