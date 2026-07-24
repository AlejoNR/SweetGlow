import { ManejadorBase } from './ManejadorBase.js'

/** Eslabon 4: el rol del usuario debe estar entre los autorizados. */
export class ValidarRol extends ManejadorBase {
  constructor(rolesPermitidos = ['admin', 'operador', 'supervisor']) {
    super()
    this.rolesPermitidos = rolesPermitidos
  }

  async manejar(solicitud) {
    const { rol } = solicitud._usuario
    if (!this.rolesPermitidos.includes(rol)) {
      return this._fallar('ValidarRol', 'No tienes un rol autorizado para acceder al sistema.')
    }
    return await super.manejar(solicitud)
  }
}
