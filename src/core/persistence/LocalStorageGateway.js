/**
 * Gateway de persistencia. Hoy usa localStorage pero expone una API
 * asincrona (async/await) para que el dia de manana se reemplace por un
 * ApiGateway (fetch a Node.js/MySQL) SIN tocar el resto del sistema.
 */
export class LocalStorageGateway {
  constructor(prefijo = 'sigi_') {
    this.prefijo = prefijo
  }

  async obtener(clave) {
    await this.#simularLatencia()
    const raw = localStorage.getItem(this.prefijo + clave)
    return raw ? JSON.parse(raw) : null
  }

  async guardar(clave, datos) {
    await this.#simularLatencia()
    localStorage.setItem(this.prefijo + clave, JSON.stringify(datos))
    return datos
  }

  async eliminar(clave) {
    await this.#simularLatencia()
    localStorage.removeItem(this.prefijo + clave)
  }

  #simularLatencia(ms = 150) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
