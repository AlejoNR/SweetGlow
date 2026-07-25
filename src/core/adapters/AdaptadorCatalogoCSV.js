/**
 * Adapta un CSV crudo al formato interno del sistema de maquillaje Sweet Glow.
 * Detecta automáticamente:
 * - El delimitador (coma, punto y coma, tabulación)
 * - La fila real de encabezados (incluso si hay títulos arriba como "SWEET GLOW COSMETICS...")
 */
export class AdaptadorCatalogoCSV {
  constructor(textoCSV, delimitadorPreferido = ',') {
    this.textoCSV = textoCSV
    this.delimitadorPreferido = delimitadorPreferido
  }

  async obtenerDatos() {
    const lineas = this.textoCSV.trim().split(/\r?\n/).filter((l) => l.trim())
    if (lineas.length < 1) return []

    // 1. Auto-detectar el delimitador correcto
    const delimitador = this.#detectarDelimitador(lineas)

    // 2. Auto-detectar en qué fila están los encabezados reales
    const indiceEncabezado = this.#detectarFilaEncabezado(lineas, delimitador)
    if (indiceEncabezado === -1) return []

    const headers = this.#parsearFila(lineas[indiceEncabezado], delimitador)
      .map((h) => this.#normalizarColumna(h))

    // 3. Procesar las filas posteriores al encabezado
    return lineas.slice(indiceEncabezado + 1).map((fila) => {
      const valores = this.#parsearFila(fila, delimitador)
      const crudo = {}
      headers.forEach((h, i) => { crudo[h] = (valores[i] || '').trim() })
      return this.#mapearAlDominio(crudo)
    }).filter(f => f.nombre && f.nombre.trim() !== '' && !f.nombre.toLowerCase().includes('producto'))
  }

  #detectarDelimitador(lineas) {
    // Si la primera o segunda línea tiene punto y coma o tabulación, usarlos
    const muestra = lineas.slice(0, 5).join('\n')
    const comas = (muestra.match(/,/g) || []).length
    const puntoYComas = (muestra.match(/;/g) || []).length
    const tabs = (muestra.match(/\t/g) || []).length

    if (puntoYComas > comas && puntoYComas > tabs) return ';'
    if (tabs > comas && tabs > puntoYComas) return '\t'
    if (comas > 0) return ','
    return this.delimitadorPreferido || ','
  }

  #detectarFilaEncabezado(lineas, delimitador) {
    // Busca las primeras 10 líneas para encontrar cuál contiene palabras clave como "producto", "nombre", "precio"
    for (let i = 0; i < Math.min(10, lineas.length); i++) {
      const columnas = this.#parsearFila(lineas[i], delimitador).map(c => c.toLowerCase().trim())
      const esHeader = columnas.some(c => 
        c.includes('producto') || 
        c.includes('nombre') || 
        c.includes('precio') || 
        c.includes('existencia') || 
        c.includes('cantidad')
      )
      if (esHeader) return i
    }
    // Si no encuentra nada explícito, asume la primera fila
    return 0
  }

  #parsearFila(fila, delimitador) {
    const resultado = []
    let actual = ''
    let enComillas = false
    for (const char of fila) {
      if (char === '"') {
        enComillas = !enComillas
      } else if (char === delimitador && !enComillas) {
        resultado.push(actual)
        actual = ''
      } else {
        actual += char
      }
    }
    resultado.push(actual)
    return resultado
  }

  #normalizarColumna(col) {
    const c = col.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .replace(/['"]/g, '')
      .replace(/\s+/g, '_')

    const mapa = {
      // Formato Sweet Glow Cosmetics
      'producto': 'nombre',
      'cantidad_ini': 'cantidadCompra',
      'cantidad_ini.': 'cantidadCompra',
      'unida_vendia': 'unidadesVendidas',
      'unida_vendida': 'unidadesVendidas',
      'unidades_vendidas': 'unidadesVendidas',
      'precio_distribuidora': 'precioCompra',
      'precio_distribuidor': 'precioCompra',
      'precio_venta': 'precioVenta',
      'ganancia_por_pr': 'gananciaPorPr',
      'ganancia_mensual': 'gananciaPorPr',
      'existencia': 'stockActual',
      'venta_neta': 'ventaNeta',
      // Formato genérico
      'nombre': 'nombre',
      'marca': 'marca',
      'categoria': 'categoria',
      'cantidad': 'cantidadCompra',
      'stock': 'stockActual',
      'precio_compra': 'precioCompra',
      'porcentaje_ganancia': 'porcentajeGanancia',
      'descripcion': 'descripcion',
    }
    return mapa[c] || c
  }

  #limpiarNumero(str) {
    if (!str) return 0
    // Eliminar símbolos de moneda ($), puntos de miles y comas decimales
    const limpio = String(str)
      .replace(/\$/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
    return Number(limpio) || 0
  }

  #mapearAlDominio(crudo) {
    const precioCompra = this.#limpiarNumero(crudo.precioCompra)
    const precioVentaRaw = this.#limpiarNumero(crudo.precioVenta)
    const cantidadCompra = this.#limpiarNumero(crudo.cantidadCompra)
    const stockActual = this.#limpiarNumero(crudo.stockActual)
    const unidadesVendidas = this.#limpiarNumero(crudo.unidadesVendidas)
    const ventaNeta = this.#limpiarNumero(crudo.ventaNeta)

    let porcentajeGanancia = 0
    if (crudo.porcentajeGanancia) {
      porcentajeGanancia = this.#limpiarNumero(crudo.porcentajeGanancia)
    } else if (precioCompra > 0 && precioVentaRaw > 0) {
      porcentajeGanancia = Math.round(((precioVentaRaw - precioCompra) / precioCompra) * 100)
    }

    return {
      nombre: (crudo.nombre || '').trim(),
      marca: (crudo.marca || '').trim(),
      categoria: (crudo.categoria || 'rostro').toLowerCase(),
      cantidadCompra,
      stockActual,
      precioCompra,
      precioVenta: precioVentaRaw,
      porcentajeGanancia,
      unidadesVendidas,
      ventaNeta,
      descripcion: (crudo.descripcion || '').trim(),
    }
  }
}
