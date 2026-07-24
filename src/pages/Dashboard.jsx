import { useState, useEffect, useRef } from 'react'
import { LocalStorageGateway } from '../core/persistence/LocalStorageGateway.js'
import { RepositorioInventario } from '../core/services/RepositorioInventario.js'
import { MotorFEFO } from '../core/services/MotorFEFO.js'
import { InventarioSubject } from '../core/observers/InventarioSubject.js'
import { UIObserver } from '../core/observers/UIObserver.js'
import { WebNotificationObserver } from '../core/observers/WebNotificationObserver.js'
import { EmailJSObserver } from '../core/observers/EmailJSObserver.js'
import { ColorEstado, EtiquetaEstado } from '../core/enums/EstadoCaducidad.js'
import AlertPanel from '../components/alerts/AlertPanel.jsx'
import Loader from '../components/common/Loader.jsx'

function Dashboard() {
  const [alimentos, setAlimentos] = useState([])
  const [cargando, setCargando] = useState(true)
  const subjectRef = useRef(null)

  useEffect(() => {
    const cargar = async () => {
      const repo = new RepositorioInventario(new LocalStorageGateway())
      const lista = await repo.listar()


      const subject = new InventarioSubject()
      const webObs = new WebNotificationObserver()
      await webObs.solicitarPermiso()


      const emailObs = new EmailJSObserver('service_4t3phqq', 'template_wp1kyob', 'QgsR08rNb-VsVDJn1', repo.gateway)


      const uiObs = new UIObserver((evento, datos) => {
        if (evento === 'inventario-actualizado') setAlimentos(datos)
      })
      subject.attach(uiObs)
      subject.attach(webObs)
      subject.attach(emailObs)
      subjectRef.current = subject


      subject.setAlimentos(lista)
      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) return <Loader texto="Cargando inventario..." />

  const grupos = MotorFEFO.clasificar(alimentos)
  const tarjetas = [
    { estado: 'critico', cantidad: grupos.critico.length },
    { estado: 'urgente', cantidad: grupos.urgente.length },
    { estado: 'preventivo', cantidad: grupos.preventivo.length },
    { estado: 'fresco', cantidad: grupos.fresco.length },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-textDark text-2xl font-bold">Dashboard</h1>
        <p className="text-textMuted text-sm">Estrategia FEFO - {alimentos.length} productos en inventario</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tarjetas.map((t) => (
          <div key={t.estado} className="card p-5">
            <div className="w-3 h-3 rounded-full mb-3" style={{ backgroundColor: ColorEstado[t.estado] }} />
            <p className="text-textMuted text-xs font-medium uppercase tracking-wider">{EtiquetaEstado[t.estado]}</p>
            <p className="text-textDark text-3xl font-bold mt-1">{t.cantidad}</p>
          </div>
        ))}
      </div>

      <AlertPanel alimentos={alimentos} />
    </div>
  )
}
export default Dashboard
