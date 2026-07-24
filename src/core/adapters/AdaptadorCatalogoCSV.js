import { FuenteAlimentos } from './FuenteAlimentos.js'

/**
 * Adapta un CSV crudo (con columnas heterogeneas) al formato que
 * entiende el AlimentoFactory. Normaliza nombres de columnas y tipos.
 */
export class AdaptadorCatalogoCSV extends FuenteAlimentos {
  constructor(textoCSV) {
    super()
    this.textoCSV = textoCSV
  }

  async obtenerDatos() {
    const lineas = this.textoCSV.trim().split(/\r?\n/).filter((l) => l.trim())
    if (lineas.length < 2) return []

    const headers = lineas[0].split(',').map((h) => this.#normalizarColumna(h))
    return lineas.slice(1).map((fila) => {
      const valores = fila.split(',').map((v) => v.trim())
      const crudo = {}
      headers.forEach((h, i) => { crudo[h] = valores[i] })
      return this.#mapearAlDominio(crudo)
    })
  }

  #normalizarColumna(col) {
    const c = col.trim().toLowerCase().replace(/['"]/g, '')
    const mapa = {
      producto: 'nombre', nombre: 'nombre', item: 'nombre',
      categoria: 'categoria', tipo: 'categoria',
      cantidad: 'cantidad', stock: 'cantidad', qty: 'cantidad',
      unidad: 'unidad', um: 'unidad',
      caducidad: 'fechaCaducidad', vencimiento: 'fechaCaducidad', expira: 'fechaCaducidad',
      lote: 'lote', batch: 'lote',
      humedad: 'humedad',
      temperatura: 'temperaturaConservacion', temp: 'temperaturaConservacion',
    }
    return mapa[c] || c
  }

  #mapearAlDominio(crudo) {
    return {
      nombre: crudo.nombre,
      categoria: String(crudo.categoria || '').toLowerCase(),
      cantidad: Number(crudo.cantidad || 0),
      unidad: crudo.unidad || 'und',
      fechaCaducidad: this.#parsearFecha(crudo.fechaCaducidad),
      lote: crudo.lote || null,
      humedad: crudo.humedad !== undefined ? Number(crudo.humedad) : undefined,
      temperaturaConservacion:
        crudo.temperaturaConservacion !== undefined ? Number(crudo.temperaturaConservacion) : undefined,
    }
  }

  #parsearFecha(str) {
    if (!str) return null
    if (str.includes('/')) {
      const [d, m, y] = str.split('/')
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      return Number.isNaN(Date.parse(iso)) ? null : new Date(iso).toISOString()
    }
    return Number.isNaN(Date.parse(str)) ? null : new Date(str).toISOString()
  }
}
