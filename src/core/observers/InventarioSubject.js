export class InventarioSubject {
  constructor() {
    this.observadores = []
    this.productos = []
  }

  attach(observador) {
    if (!this.observadores.includes(observador)) {
      this.observadores.push(observador)
    }
  }

  detach(observador) {
    this.observadores = this.observadores.filter((o) => o !== observador)
  }

  notify(evento, datos) {
    this.observadores.forEach((o) => o.actualizar(evento, datos))
  }

  setProductos(productos) {
    this.productos = productos
    this.notify('inventario-actualizado', productos)
  }

  setAlimentos(lista) {
    this.setProductos(lista)
  }
}
