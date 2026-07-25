import { Maquillaje } from './Maquillaje.js'

export class CuidadoPiel extends Maquillaje {
  constructor(datos) {
    super(datos)
    this.categoria = 'cuidado_piel'
    this.uso = datos.uso ?? 'diario' // diario, noche, semanal
  }

  validar() {
    super.validar()
    return true
  }

  obtenerDetalles() {
    return {
      ...super.obtenerDetalles(),
      Uso: this.uso
    }
  }
}
