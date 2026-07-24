import Badge from '../common/Badge.jsx'
import { MotorFEFO } from '../../core/services/MotorFEFO.js'

/** Panel de alertas FEFO: muestra los productos en ventana critica/urgente. */
function AlertPanel({ alimentos }) {
  const enAlerta = MotorFEFO.ordenar(MotorFEFO.enVentanaAlerta(alimentos))

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-textDark font-semibold">Alertas FEFO (margen 72h)</h3>
        <span className="text-textMuted text-sm">{enAlerta.length} activas</span>
      </div>
      {enAlerta.length === 0 ? (
        <p className="text-textMuted text-sm py-6 text-center">
          No hay productos en ventana de alerta. Todo bajo control.
        </p>
      ) : (
        <ul className="space-y-2">
          {enAlerta.map((a) => {
            const horas = Math.round(a.horasParaCaducar())
            return (
              <li key={a.id} className="flex items-center justify-between bg-inputBg border border-border rounded-lg px-4 py-3">
                <div>
                  <p className="text-textDark text-sm font-medium">{a.nombre}</p>
                  <p className="text-textMuted text-xs mt-0.5">
                    Lote {a.lote || 'N/A'} - {horas <= 0 ? 'VENCIDO' : `${horas}h restantes`}
                  </p>
                </div>
                <Badge estado={a.estadoCaducidad()} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
export default AlertPanel
