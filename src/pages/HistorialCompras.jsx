import { useState, useEffect, useMemo } from 'react'
import { RepositorioCompras } from '../core/services/RepositorioCompras.js'
import { RepositorioVentas } from '../core/services/RepositorioVentas.js'
import AddCompraModal from '../components/inventory/AddCompraModal.jsx'
import AddVentaModal from '../components/inventory/AddVentaModal.jsx'
import Loader from '../components/common/Loader.jsx'

const TABS = [
  { id: 'compras', label: 'Historial de Compras', icon: 'fa-cart-shopping' },
  { id: 'ventas', label: 'Historial de Ventas', icon: 'fa-receipt' },
]

function HistorialCompras() {
  const [tab, setTab] = useState('compras')
  const [compras, setCompras] = useState([])
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalCompra, setModalCompra] = useState(false)
  const [modalVenta, setModalVenta] = useState(false)

  const cargarDatos = async () => {
    setCargando(true)
    const repoC = new RepositorioCompras()
    const repoV = new RepositorioVentas()
    const [listaC, listaV] = await Promise.all([repoC.listar(), repoV.listar()])
    setCompras(listaC)
    setVentas(listaV)
    setCargando(false)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const comprasFiltradas = useMemo(() => {
    if (!busqueda) return compras
    const b = busqueda.toLowerCase()
    return compras.filter(c => c.productoNombre?.toLowerCase().includes(b) || c.marca?.toLowerCase().includes(b))
  }, [compras, busqueda])

  const ventasFiltradas = useMemo(() => {
    if (!busqueda) return ventas
    const b = busqueda.toLowerCase()
    return ventas.filter(v => v.productoNombre?.toLowerCase().includes(b))
  }, [ventas, busqueda])

  const totalInversion = useMemo(() => compras.reduce((acc, c) => acc + c.totalInversion, 0), [compras])
  const totalVentaNeta = useMemo(() => ventas.reduce((acc, v) => acc + v.totalVenta, 0), [ventas])

  const formatFecha = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
  const formatMoneda = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-textDark text-2xl font-bold">Compras & Ventas</h1>
          <p className="text-textMuted text-sm">Registro histórico de entradas de mercancía y movimientos de venta</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => setModalCompra(true)} className="btn-dark flex-1 md:flex-none justify-center">
            <i className="fa-solid fa-cart-plus text-primary"></i> + Registrar Compra
          </button>
          <button onClick={() => setModalVenta(true)} className="btn-primary flex-1 md:flex-none justify-center">
            <i className="fa-solid fa-basket-shopping"></i> + Registrar Venta
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-primaryLt flex items-center justify-center mb-3">
            <i className="fa-solid fa-cart-shopping text-primary"></i>
          </div>
          <p className="text-textMuted text-xs font-semibold uppercase tracking-wider">Total Compras Registradas</p>
          <p className="text-textDark text-3xl font-bold mt-1">{compras.length}</p>
        </div>

        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
            <i className="fa-solid fa-dollar-sign text-purple-600"></i>
          </div>
          <p className="text-textMuted text-xs font-semibold uppercase tracking-wider">Inversión Total en Compras</p>
          <p className="text-textDark text-2xl font-bold mt-1">{formatMoneda(totalInversion)}</p>
        </div>

        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <i className="fa-solid fa-receipt text-emerald-600"></i>
          </div>
          <p className="text-textMuted text-xs font-semibold uppercase tracking-wider">Total Ventas Registradas</p>
          <p className="text-textDark text-2xl font-bold mt-1">{formatMoneda(totalVentaNeta)}</p>
        </div>
      </div>

      {/* Tabs y Tabla */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-border bg-white">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                tab === t.id ? 'border-primary text-primary bg-primaryLt/30' : 'border-transparent text-textMuted hover:text-textDark'
              }`}
            >
              <i className={`fa-solid ${t.icon}`}></i> {t.label}
              <span className="ml-1 bg-primaryLt text-primary text-xs px-2 py-0.5 rounded-full font-bold">
                {t.id === 'compras' ? compras.length : ventas.length}
              </span>
            </button>
          ))}
          
          <div className="flex-1 flex items-center justify-end px-4">
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-xs"></i>
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-field pl-8 text-xs py-1.5 w-48"
              />
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="p-12 flex justify-center"><Loader texto="Cargando registros..." /></div>
        ) : (
          <>
            {tab === 'compras' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-inputBg text-textMuted text-xs font-semibold uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="px-5 py-3">Fecha</th>
                      <th className="px-5 py-3">Producto</th>
                      <th className="px-5 py-3 text-center">Cantidad</th>
                      <th className="px-5 py-3 text-right">Precio Compra</th>
                      <th className="px-5 py-3 text-center">% Ganancia</th>
                      <th className="px-5 py-3 text-right text-emerald-600">Precio Venta</th>
                      <th className="px-5 py-3 text-right">Total Inversión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comprasFiltradas.length === 0 ? (
                      <tr><td colSpan="7" className="px-5 py-8 text-center text-textMuted">Sin registros de compra.</td></tr>
                    ) : comprasFiltradas.map(c => (
                      <tr key={c.id} className="hover:bg-primaryLt/20 transition-colors">
                        <td className="px-5 py-3 text-textMuted text-xs font-medium">{formatFecha(c.fechaCompra)}</td>
                        <td className="px-5 py-3">
                          <p className="font-bold text-textDark">{c.productoNombre}</p>
                          {c.marca && <p className="text-xs text-textMuted">{c.marca}</p>}
                        </td>
                        <td className="px-5 py-3 text-center font-bold text-textDark">{c.cantidad}</td>
                        <td className="px-5 py-3 text-right font-mono text-textMuted">{formatMoneda(c.precioCompra)}</td>
                        <td className="px-5 py-3 text-center">
                          <span className="bg-primaryLt text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">{c.porcentajeGanancia}%</span>
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-600">{formatMoneda(c.precioVenta)}</td>
                        <td className="px-5 py-3 text-right font-mono text-textDark font-semibold">{formatMoneda(c.totalInversion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'ventas' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-inputBg text-textMuted text-xs font-semibold uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="px-5 py-3">Fecha</th>
                      <th className="px-5 py-3">Producto</th>
                      <th className="px-5 py-3 text-center">Unidades Vendidas</th>
                      <th className="px-5 py-3 text-right">Precio Venta</th>
                      <th className="px-5 py-3 text-right text-emerald-600">Total Venta</th>
                      <th className="px-5 py-3">Observación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ventasFiltradas.length === 0 ? (
                      <tr><td colSpan="6" className="px-5 py-8 text-center text-textMuted">Sin ventas registradas.</td></tr>
                    ) : ventasFiltradas.map(v => (
                      <tr key={v.id} className="hover:bg-primaryLt/20 transition-colors">
                        <td className="px-5 py-3 text-textMuted text-xs font-medium">{formatFecha(v.fechaVenta)}</td>
                        <td className="px-5 py-3">
                          <p className="font-bold text-textDark">{v.productoNombre}</p>
                          {v.marca && <p className="text-xs text-textMuted">{v.marca}</p>}
                        </td>
                        <td className="px-5 py-3 text-center font-bold text-textDark">{v.cantidadVendida}</td>
                        <td className="px-5 py-3 text-right font-mono text-textMuted">{formatMoneda(v.precioVenta)}</td>
                        <td className="px-5 py-3 text-right font-extrabold text-emerald-600">{formatMoneda(v.totalVenta)}</td>
                        <td className="px-5 py-3 text-xs text-textMuted">{v.nota || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {modalCompra && <AddCompraModal onGuardarExitoso={() => { setModalCompra(false); cargarDatos(); }} onCerrar={() => setModalCompra(false)} />}
      {modalVenta && <AddVentaModal onGuardarExitoso={() => { setModalVenta(false); cargarDatos(); }} onCerrar={() => setModalVenta(false)} />}
    </div>
  )
}
export default HistorialCompras
