import { MaquillajeFactory } from '../factories/MaquillajeFactory.js'

/**
 * Repositorio que persiste y reconstruye productos de maquillaje.
 * Se comunica con el FirestoreGateway para guardar en la base de datos.
 */
export class RepositorioInventario {
  constructor(gateway) {
    this.gateway = gateway
  }

  async listar() {
    const datos = await this.gateway.obtener()
    const productos = []
    for (const d of datos) {
      try {
        productos.push(MaquillajeFactory.crearProducto(d.categoria, d))
      } catch (e) {
        console.warn('Registro de inventario invalido, se omite:', d, e.message)
      }
    }
    return productos
  }

  async guardar(producto) {
    await this.gateway.guardar(producto.id, producto.toJSON())
    return producto
  }

  async guardarVarios(productos) {
    for (const p of productos) {
      await this.gateway.guardar(p.id, p.toJSON())
    }
    return productos
  }

  async eliminar(id) {
    await this.gateway.eliminar(id)
  }
}
