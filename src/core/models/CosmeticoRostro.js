import { Maquillaje } from './Maquillaje.js'

export class CosmeticoRostro extends Maquillaje {
  constructor(datos) {
    super(datos)
    this.categoria = 'rostro'
    this.tipoPiel = datos.tipoPiel ?? 'todo tipo'
    this.cobertura = datos.cobertura ?? 'media'
  }

  validar() {
    super.validar()
    return true
  }

  obtenerDetalles() {
    return {
      ...super.obtenerDetalles(),
      'Tipo de Piel': this.tipoPiel,
      Cobertura: this.cobertura,
    }
  }
}
