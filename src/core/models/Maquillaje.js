/**
 * Clase ABSTRACTA para productos de Maquillaje (Inventario Simplificado).
 */
export class Maquillaje {
  constructor({ id, nombre, marca, tono, cantidad, unidad, precioCompra, porcentajeGanancia, descripcion, imagenUrl, categoria }) {
    if (new.target === Maquillaje) {
      throw new Error('Maquillaje es abstracta: usa una subclase o el Factory.')
    }
    this.id = id ?? crypto.randomUUID()
    this.nombre = nombre
    this.marca = marca ?? ''
    this.tono = tono ?? ''
    this.cantidad = Number(cantidad) || 0
    this.unidad = unidad ?? 'und'
    this.precioCompra = Number(precioCompra) || 0
    this.porcentajeGanancia = Number(porcentajeGanancia) || 0
    this.descripcion = descripcion ?? ''
    this.imagenUrl = imagenUrl ?? ''
    
    // Auto-cálculo del precio de venta (Precio de Compra + Margen)
    this.precioVenta = this.precioCompra + (this.precioCompra * (this.porcentajeGanancia / 100))
    
    this.categoria = categoria || 'generico'
    this.fechaIngreso = new Date().toISOString()
  }

  validar() {
    if (!this.nombre || String(this.nombre).trim() === '') {
      throw new Error('El nombre del producto es obligatorio.')
    }
    if (this.cantidad < 0) {
      throw new Error('La cantidad debe ser un número positivo.')
    }
    if (this.precioCompra < 0 || this.porcentajeGanancia < 0) {
      throw new Error('Los precios y márgenes deben ser positivos.')
    }
    return true
  }

  obtenerDetalles() {
    return { 
      marca: this.marca, 
      tono: this.tono,
      'Precio Venta': `$${this.precioVenta.toFixed(2)}`
    }
  }

  toJSON() {
    return { ...this }
  }
}
