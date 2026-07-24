import { useState, useEffect } from 'react'
import { useSession } from './context/SessionContext.jsx'
import { sembrarDatos } from './core/services/SeedData.js'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inventory from './pages/Inventory.jsx'
import ImportarCatalogo from './pages/ImportarCatalogo.jsx'
import Reportes from './pages/Reportes.jsx'
import Usuarios from './pages/Usuarios.jsx'
import Lotes from './pages/Lotes.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Topbar from './components/layout/Topbar.jsx'

function App() {
  const { usuario } = useSession()
  const [vista, setVista] = useState('dashboard')
  const [listo, setListo] = useState(false)

  useEffect(() => {
    sembrarDatos().then(() => setListo(true))
  }, [])

  if (!listo) return <div className="min-h-screen bg-[#07130F]" />
  if (!usuario) return <Login />

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar vista={vista} setVista={setVista} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {vista === 'dashboard' && <Dashboard />}
          {vista === 'inventory' && <Inventory />}
          {vista === 'lotes' && <Lotes />}
          {vista === 'importar' && <ImportarCatalogo />}
          {vista === 'reportes' && <Reportes />}
          {vista === 'usuarios' && <Usuarios />}
        </main>
      </div>
    </div>
  )
}

export default App
