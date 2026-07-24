/**
 * Eslabon base de la cadena. Define el contrato y el reenvio al
 * siguiente manejador. Las subclases sobrescriben manejar().
 *
 * Resultado: { exito, paso, mensaje, data }
 */
export class ManejadorBase {
  constructor() {
    if (new.target === ManejadorBase) {
      throw new Error('ManejadorBase es abstracta: no se instancia directamente.')
    }
    this.siguiente = null
  }

  setSiguiente(manejador) {
    this.siguiente = manejador
    return manejador
  }

  async manejar(solicitud) {
    if (this.siguiente) {
      return await this.siguiente.manejar(solicitud)
    }
    return { exito: true, paso: 'fin', mensaje: 'Autenticacion exitosa.', data: solicitud }
  }

  _fallar(paso, mensaje) {
    return { exito: false, paso, mensaje, data: null }
  }
}
