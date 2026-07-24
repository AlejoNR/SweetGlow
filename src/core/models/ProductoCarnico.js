import { Alimento } from './Alimento.js'

/** Carnes y derivados. Riesgo principal: cadena de frio. */
export class ProductoCarnico extends Alimento {
  constructor(datos) {
    super(datos)
    this.categoria = 'carnico'
    this.temperaturaConservacion = Number(datos.temperaturaConservacion ?? -18)
    this.tipoCorte = datos.tipoCorte ?? 'general'
  }

  validar() {
    super.validar()
    if (this.temperaturaConservacion > 4) {
      throw new Error('Los productos carnicos deben conservarse a 4C o menos.')
    }
    return true
  }

  obtenerDetalles() {
    return {
      'Temp. conservacion': `${this.temperaturaConservacion}C`,
      'Tipo de corte': this.tipoCorte,
    }
  }
}
