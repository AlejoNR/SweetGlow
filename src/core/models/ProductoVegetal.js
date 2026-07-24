import { Alimento } from './Alimento.js'

export class ProductoVegetal extends Alimento {
  constructor(datos) {
    super(datos)
    this.categoria = 'vegetal'
    this.organico = Boolean(datos.organico ?? false)
  }

  obtenerDetalles() {
    return { Organico: this.organico ? 'Si' : 'No' }
  }
}
