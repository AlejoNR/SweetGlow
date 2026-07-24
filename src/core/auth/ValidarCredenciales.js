import { ManejadorBase } from './ManejadorBase.js'

/**
 * Eslabon 2: verifica que el usuario exista y la contrasena coincida.
 * Recibe el gateway por inyeccion de dependencias (no lo crea el mismo).
 */
export class ValidarCredenciales extends ManejadorBase {
  constructor(gateway) {
    super()
    this.gateway = gateway
  }

  async manejar(solicitud) {
    const usuarios = (await this.gateway.obtener('usuarios')) || []
    const usuario = usuarios.find((u) => u.email === solicitud.email)

    if (!usuario) {
      return this._fallar('ValidarCredenciales', 'Correo o contrasena incorrectos.')
    }
    
    const bcrypt = await import('bcryptjs');
    let isValid = false;
    try {
      isValid = bcrypt.compareSync(solicitud.password, usuario.password);
    } catch (error) {
      isValid = solicitud.password === usuario.password;
    }
    
    if (!isValid) {
      return this._fallar('ValidarCredenciales', 'Correo o contrasena incorrectos.')
    }

    solicitud._usuario = usuario
    return await super.manejar(solicitud)
  }
}
