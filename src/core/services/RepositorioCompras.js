import { FirestoreGateway } from '../persistence/FirestoreGateway.js'
import { EntradaCompra } from '../models/EntradaCompra.js'

export class RepositorioCompras {
  constructor() {
    this.gateway = new FirestoreGateway('compras')
  }

  async registrar(entrada) {
    const doc = entrada instanceof EntradaCompra ? entrada : new EntradaCompra(entrada)
    await this.gateway.guardar(doc.id, doc.toJSON())
    return doc
  }

  async listar() {
    const datos = await this.gateway.obtener()
    return datos.map(d => new EntradaCompra(d)).sort(
      (a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra)
    )
  }

  async listarPorProducto(productoId) {
    const todos = await this.listar()
    return todos.filter(e => e.productoId === productoId)
  }
}
