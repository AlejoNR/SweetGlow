import { Maquillaje } from './Maquillaje.js'

export class CosmeticoOjos extends Maquillaje {
  constructor(datos) {
    super(datos)
    this.categoria = 'ojos'
    this.waterproof = datos.waterproof ?? false
  }

  validar() {
    super.validar()
    return true
  }

  obtenerDetalles() {
    return {
      ...super.obtenerDetalles(),
      Waterproof: this.waterproof ? 'Sí' : 'No'
    }
  }
}
