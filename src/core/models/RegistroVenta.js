/**
 * Representa una venta registrada.
 * Se registra cuando se vende una unidad de un producto.
 */
export class RegistroVenta {
  constructor({ productoId, productoNombre, marca, categoria, cantidadVendida, precioVenta, fechaVenta, nota }) {
    this.id = crypto.randomUUID()
    this.productoId = productoId
    this.productoNombre = productoNombre
    this.marca = marca ?? ''
    this.categoria = categoria ?? 'rostro'
    this.cantidadVendida = Number(cantidadVendida) || 0
    this.precioVenta = Number(precioVenta) || 0
    this.totalVenta = this.cantidadVendida * this.precioVenta
    this.fechaVenta = fechaVenta ?? new Date().toISOString()
    this.nota = nota ?? ''
  }

  toJSON() {
    return { ...this }
  }
}
