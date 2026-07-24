import { Observer } from './Observer.js'

/**
 * Observador puente hacia la UI. Recibe un callback (inyectado por React)
 * y lo invoca en cada notificacion. Asi el patron permanece puro: no sabe
 * nada de React, solo ejecuta una funcion.
 */
export class UIObserver extends Observer {
  constructor(callback) {
    super()
    this.callback = callback
  }

  actualizar(evento, datos) {
    this.callback(evento, datos)
  }
}
