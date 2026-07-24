import { ManejadorBase } from './ManejadorBase.js'

/** Eslabon 3: la cuenta debe estar activa (no suspendida/inactiva). */
export class ValidarEstado extends ManejadorBase {
  async manejar(solicitud) {
    const usuario = solicitud._usuario
    if (usuario.estado !== 'activo') {
      return this._fallar(
        'ValidarEstado',
        'Tu cuenta esta inactiva o suspendida. Contacta al administrador.'
      )
    }
    return await super.manejar(solicitud)
  }
}
