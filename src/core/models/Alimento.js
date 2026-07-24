/**
 * Clase ABSTRACTA. Define el comportamiento comun y la logica FEFO.
 * No puede instanciarse directamente; solo a traves de sus subclases.
 */
export class Alimento {
  constructor({ id, nombre, cantidad, unidad, fechaIngreso, fechaCaducidad, lote }) {
    if (new.target === Alimento) {
      throw new Error('Alimento es abstracta: usa una subclase o el AlimentoFactory.')
    }
    this.id = id ?? crypto.randomUUID()
    this.nombre = nombre
    this.cantidad = Number(cantidad)
    this.unidad = unidad ?? 'und'
    this.fechaIngreso = fechaIngreso ?? new Date().toISOString()
    this.fechaCaducidad = fechaCaducidad
    this.lote = lote ?? null
    this.categoria = 'generico'
  }

  /** Validacion base. Las subclases la extienden con super.validar(). */
  validar() {
    if (!this.nombre || String(this.nombre).trim() === '') {
      throw new Error('El nombre del alimento es obligatorio.')
    }
    if (Number.isNaN(this.cantidad) || this.cantidad < 0) {
      throw new Error('La cantidad debe ser un numero positivo.')
    }
    if (!this.fechaCaducidad || Number.isNaN(Date.parse(this.fechaCaducidad))) {
      throw new Error('La fecha de caducidad es obligatoria y valida (requerida para FEFO).')
    }
    return true
  }

  /** Nucleo de FEFO: horas que faltan para caducar. */
  horasParaCaducar(ahora = new Date()) {
    const caducidad = new Date(this.fechaCaducidad)
    return (caducidad - ahora) / (1000 * 60 * 60)
  }

  /** Clasificacion semantica segun el margen de 72h. */
  estadoCaducidad(ahora = new Date()) {
    const horas = this.horasParaCaducar(ahora)
    if (horas <= 24) return 'critico'
    if (horas <= 72) return 'urgente'
    if (horas <= 168) return 'preventivo'
    return 'fresco'
  }

  /** Datos especificos de cada subclase (para mostrar en la UI). */
  obtenerDetalles() {
    return {}
  }

  toJSON() {
    return { ...this }
  }
}
