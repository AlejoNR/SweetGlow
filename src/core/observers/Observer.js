/** Interfaz observador. Todo observador concreto implementa actualizar(). */
export class Observer {
  actualizar(evento, datos) {
    throw new Error('actualizar() debe implementarse en el observador concreto.')
  }
}
