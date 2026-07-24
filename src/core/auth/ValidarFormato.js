import { ManejadorBase } from './ManejadorBase.js'

/** Eslabon 1: valida la forma de los datos antes de tocar persistencia. */
export class ValidarFormato extends ManejadorBase {
  async manejar(solicitud) {
    const { email, password } = solicitud
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || !regexEmail.test(email)) {
      return this._fallar('ValidarFormato', 'El correo no tiene un formato valido.')
    }
    if (!password || password.length < 6) {
      return this._fallar('ValidarFormato', 'La contrasena debe tener al menos 6 caracteres.')
    }
    return await super.manejar(solicitud)
  }
}
