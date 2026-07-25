import { useState, useEffect, useMemo } from 'react'
import { FirestoreGateway } from '../core/persistence/FirestoreGateway.js'
import { RepositorioInventario } from '../core/services/RepositorioInventario.js'
import InventoryTable from '../components/inventory/InventoryTable.jsx'
import AddProductoModal from '../components/inventory/AddProductoModal.jsx'
import EditFoodModal from '../components/inventory/EditFoodModal.jsx'
import ProductDetailModal from '../components/inventory/ProductDetailModal.jsx'
import Loader from '../components/common/Loader.jsx'

function Inventory() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [productoDetalle, setProductoDetalle] = useState(null)
  
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')

  const repo = new RepositorioInventario(new FirestoreGateway())

  const cargar = async () => {
    setCargando(true)
    setProductos(await repo.listar())
    setCargando(false)
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleGuardarProductoExitoso = async () => {
    await cargar()
    setModalAbierto(false)
  }

  const handleActualizar = async (producto) => {
    await repo.guardar(producto) 
    setProductoEditando(null)
    await cargar()
  }

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este producto?')
    if (confirmar) {
      await repo.eliminar(id)
      await cargar()
    }
  }

  const filtrados = useMemo(() => {
    let lista = productos
    if (filtroCategoria !== 'todas') {
      lista = lista.filter((p) => p.categoria === filtroCategoria)
    }
    if (busqueda.trim() !== '') {
      const b = busqueda.toLowerCase()
      lista = lista.filter((p) => 
        p.nombre?.toLowerCase().includes(b) || 
        p.marca?.toLowerCase().includes(b) ||
        p.lote?.toLowerCase().includes(b)
      )
    }
    return lista
  }, [productos, busqueda, filtroCategoria])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-textDark text-2xl font-bold">Inventario</h1>
          <p className="text-textMuted text-sm">Gestiona tus productos de maquillaje</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-textMuted"></i>
            <input 
              type="text" 
              placeholder="Buscar producto, marca o lote..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <select 
            className="input-field w-auto min-w-[140px]"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="todas">Todas las categorías</option>
            <option value="rostro">Rostro</option>
            <option value="ojos">Ojos</option>
            <option value="labios">Labios</option>
            <option value="cuidado_piel">Cuidado de la Piel</option>
          </select>
        </div>

        <div className="flex w-full md:w-auto gap-2">
          <button className="btn-primary flex-1 md:flex-none justify-center" onClick={() => setModalAbierto(true)}>
            <i className="fa-solid fa-plus-circle"></i> Registrar Producto
          </button>
        </div>
      </div>

      <div className="card">
        {cargando ? <Loader /> : <InventoryTable productos={filtrados} onEliminar={handleEliminar} onEditar={setProductoEditando} onVerDetalle={setProductoDetalle} />}
        
        <div className="p-4 border-t border-border flex justify-between items-center text-sm text-textMuted bg-inputBg rounded-b-xl">
          <span>Mostrando {filtrados.length} de {productos.length} items</span>
        </div>
      </div>

      {modalAbierto && <AddProductoModal onGuardarExitoso={handleGuardarProductoExitoso} onCerrar={() => setModalAbierto(false)} />}
      
      {productoEditando && <EditFoodModal producto={productoEditando} onActualizar={handleActualizar} onCerrar={() => setProductoEditando(null)} />}

      {productoDetalle && <ProductDetailModal producto={productoDetalle} onCerrar={() => setProductoDetalle(null)} />}
    </div>
  )
}
export default Inventory
