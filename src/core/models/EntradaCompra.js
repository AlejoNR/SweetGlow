/**
 * Representa una entrada de compra de productos.
 * Cada vez que se compra un lote de un producto, se registra una instancia de este modelo.
 */
export class EntradaCompra {
  constructor({ productoId, productoNombre, marca, categoria, cantidad, precioCompra, precioVenta, porcentajeGanancia, fechaCompra }) {
    this.id = crypto.randomUUID()
    this.productoId = productoId
    this.productoNombre = productoNombre
    this.marca = marca ?? ''
    this.categoria = categoria ?? 'rostro'
    this.cantidad = Number(cantidad) || 0
    this.precioCompra = Number(precioCompra) || 0
    this.porcentajeGanancia = Number(porcentajeGanancia) || 0
    this.precioVenta = Number(precioVenta) || (this.precioCompra + this.precioCompra * (this.porcentajeGanancia / 100))
    this.fechaCompra = fechaCompra ?? new Date().toISOString()
    this.totalInversion = this.precioCompra * this.cantidad
  }

  toJSON() {
    return { ...this }
  }
}
