import { Observer } from './Observer.js'

/** Observador que usa la API Notification del navegador. */
export class WebNotificationObserver extends Observer {
  constructor() {
    super()
    this.permisoConcedido = false
  }

  async solicitarPermiso() {
    if (typeof Notification === 'undefined') return false
    if (Notification.permission === 'granted') {
      this.permisoConcedido = true
    } else if (Notification.permission !== 'denied') {
      const r = await Notification.requestPermission()
      this.permisoConcedido = r === 'granted'
    }
    return this.permisoConcedido
  }

  actualizar(evento, datos) {
    if (evento !== 'alerta-caducidad') return
    if (!this.permisoConcedido || typeof Notification === 'undefined') return
    
    // Evitar enviar notificaciones múltiples veces por sesión
    if (sessionStorage.getItem('notificacion_fefo_enviada') === 'true') {
      return
    }

    new Notification('Alerta FEFO - FreshControl', {
      body: `${datos.length} producto(s) requieren atencion por caducidad (margen 72h).`,
    })

    sessionStorage.setItem('notificacion_fefo_enviada', 'true')
  }
}
