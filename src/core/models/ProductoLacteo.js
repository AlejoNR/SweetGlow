import { Alimento } from './Alimento.js'

export class ProductoLacteo extends Alimento {
  constructor(datos) {
    super(datos)
    this.categoria = 'lacteo'
    this.pasteurizado = Boolean(datos.pasteurizado ?? true)
  }

  obtenerDetalles() {
    return { Pasteurizado: this.pasteurizado ? 'Si' : 'No' }
  }
}
