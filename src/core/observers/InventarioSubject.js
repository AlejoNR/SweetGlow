
export class InventarioSubject {
  constructor() {
    this.observadores = []
    this.alimentos = []
  }

  attach(observador) {
    if (!this.observadores.includes(observador)) {
      this.observadores.push(observador)
    }
  }

  detach(observador) {
    this.observadores = this.observadores.filter((o) => o !== observador)
  }

  notify(evento, datos) {
    this.observadores.forEach((o) => o.actualizar(evento, datos))
  }

  /** Actualiza el inventario y dispara alertas si hay productos en riesgo. */
  setAlimentos(alimentos, ahora = new Date()) {
    this.alimentos = alimentos
    const enRiesgo = alimentos.filter((a) =>
      ['critico', 'urgente'].includes(a.estadoCaducidad(ahora))
    )
    this.notify('inventario-actualizado', alimentos)
    if (enRiesgo.length > 0) {
      this.notify('alerta-caducidad', enRiesgo)
    }
  }
}
