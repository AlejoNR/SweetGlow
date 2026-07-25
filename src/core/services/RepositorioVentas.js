import { FirestoreGateway } from '../persistence/FirestoreGateway.js'
import { RegistroVenta } from '../models/RegistroVenta.js'

export class RepositorioVentas {
  constructor() {
    this.gateway = new FirestoreGateway('ventas')
  }

  async registrar(venta) {
    const doc = venta instanceof RegistroVenta ? venta : new RegistroVenta(venta)
    await this.gateway.guardar(doc.id, doc.toJSON())
    return doc
  }

  async listar() {
    const datos = await this.gateway.obtener()
    return datos.map(d => new RegistroVenta(d)).sort(
      (a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta)
    )
  }

  async listarPorProducto(productoId) {
    const todos = await this.listar()
    return todos.filter(v => v.productoId === productoId)
  }
}
