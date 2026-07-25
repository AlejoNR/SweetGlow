import { Maquillaje } from './Maquillaje.js'

export class CosmeticoLabios extends Maquillaje {
  constructor(datos) {
    super(datos)
    this.categoria = 'labios'
    this.acabado = datos.acabado ?? 'mate'
  }

  validar() {
    super.validar()
    return true
  }

  obtenerDetalles() {
    return {
      ...super.obtenerDetalles(),
      Acabado: this.acabado
    }
  }
}
