/**
 * Interfaz/clase base para cualquier fuente de alimentos.
 * Define el contrato que el resto del sistema espera, sin importar
 * si los datos vienen de un CSV, un Excel, una API externa, etc.
 */
export class FuenteAlimentos {
  async obtenerDatos() {
    throw new Error('obtenerDatos() debe implementarse en la fuente concreta.')
  }
}
