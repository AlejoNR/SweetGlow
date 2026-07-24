import { useState, useEffect, useCallback, useMemo } from 'react'
import { LocalStorageGateway } from '../core/persistence/LocalStorageGateway.js'
import { RepositorioInventario } from '../core/services/RepositorioInventario.js'
import InventoryTable from '../components/inventory/InventoryTable.jsx'
import AddFoodModal from '../components/inventory/AddFoodModal.jsx'
import EditFoodModal from '../components/inventory/EditFoodModal.jsx'

import Loader from '../components/common/Loader.jsx'
import { MotorFEFO } from '../core/services/MotorFEFO.js'

function Inventory() {
  const [alimentos, setAlimentos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalAdd, setModalAdd] = useState(false)
  const [alimentoEditando, setAlimentoEditando] = useState(null)


  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('Todos')

  const repo = new RepositorioInventario(new LocalStorageGateway())

  const recargar = useCallback(async () => {
    setCargando(true)
    setAlimentos(await repo.listar())
    setCargando(false)
  }, [])

  useEffect(() => { recargar() }, [recargar])

  const handleAgregar = async (alimento) => {
    await repo.guardar(alimento)
    setModalAdd(false)
    recargar()
  }

  const handleActualizar = async (alimento) => {
    await repo.guardar(alimento) // El repositorio guarda sobrescribiendo si el ID existe
    setAlimentoEditando(null)
    recargar()
  }



  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este alimento?')
    if (!confirmar) return
    await repo.eliminar(id)
    recargar()
  }

  const categoriasMenu = [
    { label: 'Todos', id: 'Todos', icon: null },
    { label: 'Cárnico', id: 'carnico', icon: 'fa-drumstick-bite' },
    { label: 'Lácteo', id: 'lacteo', icon: 'fa-cheese' },
    { label: 'Fruta/Verd.', id: 'vegetal', icon: 'fa-apple-whole' },
    { label: 'Seco', id: 'seco', icon: 'fa-wheat-awn' },
  ]

  // Filter and sort the list
  const filtrados = useMemo(() => {
    let lista = alimentos
    if (filtroCategoria !== 'Todos') {
      lista = lista.filter(a => a.categoria.toLowerCase() === filtroCategoria.toLowerCase())
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      lista = lista.filter(a => a.nombre.toLowerCase().includes(q) || (a.lote && a.lote.toLowerCase().includes(q)))
    }
    return MotorFEFO.ordenar(lista)
  }, [alimentos, busqueda, filtroCategoria])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <i className="fa-solid fa-boxes-stacked text-primary text-xl"></i>
        <h1 className="text-primary font-bold text-lg">Inventario ordenado por FEFO</h1>
        <span className="text-textMuted text-xs font-medium ml-2">(fecha de vencimiento más próxima primero)</span>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-64">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Buscar alimento..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 overflow-x-auto">
          {categoriasMenu.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFiltroCategoria(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${filtroCategoria === cat.id
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              {cat.icon && <i className={`fa-solid ${cat.icon}`}></i>}
              {cat.label}
            </button>
          ))}
        </div>

        <button onClick={() => setModalAdd(true)} className="btn-primary rounded-full px-5 py-2 text-sm ml-auto whitespace-nowrap shadow-md shadow-primary/30 flex items-center gap-2">
          <i className="fa-solid fa-plus"></i> Registrar alimento
        </button>
      </div>

      <div className="card overflow-hidden border border-gray-100 shadow-sm">
        {cargando ? <Loader /> : <InventoryTable alimentos={filtrados} onEliminar={handleEliminar} onEditar={setAlimentoEditando} />}

        {!cargando && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-textMuted bg-gray-50/50">
            <span>Mostrando {filtrados.length} de {alimentos.length} items</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-left"></i></button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white font-medium">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white hover:bg-gray-50">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white hover:bg-gray-50">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
        )}
      </div>

      {modalAdd && <AddFoodModal onAgregar={handleAgregar} onCerrar={() => setModalAdd(false)} />}
      {alimentoEditando && <EditFoodModal alimento={alimentoEditando} onActualizar={handleActualizar} onCerrar={() => setAlimentoEditando(null)} />}

    </div>
  )
}
export default Inventory
