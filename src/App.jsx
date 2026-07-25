import { useState, useEffect } from 'react'
import { sembrarDatos } from './core/services/SeedData.js'

import Dashboard from './pages/Dashboard.jsx'
import Inventory from './pages/Inventory.jsx'
import ImportarCatalogo from './pages/ImportarCatalogo.jsx'
import HistorialCompras from './pages/HistorialCompras.jsx'
import Estadisticas from './pages/Estadisticas.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Topbar from './components/layout/Topbar.jsx'

function App() {
  const [vista, setVista] = useState('dashboard')
  const [listo, setListo] = useState(false)

  useEffect(() => {
    sembrarDatos().then(() => setListo(true))
  }, [])

  if (!listo) return <div className="min-h-screen bg-[#07130F]" />

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar vista={vista} setVista={setVista} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {vista === 'dashboard' && <Dashboard />}
          {vista === 'inventory' && <Inventory />}
          {vista === 'historial' && <HistorialCompras />}
          {vista === 'importar' && <ImportarCatalogo />}
          {vista === 'estadisticas' && <Estadisticas />}
        </main>
      </div>
    </div>
  )
}

export default App
