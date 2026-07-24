import { Alimento } from './Alimento.js'

/** Granos, harinas, enlatados. Riesgo principal: humedad -> hongos. */
export class ProductoSeco extends Alimento {
  constructor(datos) {
    super(datos)
    this.categoria = 'seco'
    this.humedad = Number(datos.humedad ?? 0)
    this.humedadMaxima = Number(datos.humedadMaxima ?? 14)
  }

  validar() {
    super.validar()
    if (Number.isNaN(this.humedad) || this.humedad < 0) {
      throw new Error('La humedad debe ser un porcentaje valido.')
    }
    if (this.humedad > this.humedadMaxima) {
      throw new Error(
        `Humedad ${this.humedad}% supera el maximo permitido (${this.humedadMaxima}%). ` +
        'Riesgo de proliferacion de hongos: lote rechazado.'
      )
    }
    return true
  }

  obtenerDetalles() {
    return {
      Humedad: `${this.humedad}%`,
      'Humedad max.': `${this.humedadMaxima}%`,
    }
  }
}
