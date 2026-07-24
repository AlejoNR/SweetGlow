import { AlimentoFactory } from '../factories/AlimentoFactory.js'

/**
 * Repositorio que persiste y reconstruye alimentos. Al leer del gateway
 * reconstruye las instancias a traves del AlimentoFactory, de modo que
 * siempre se trabaja con objetos de dominio (con sus metodos), no JSON plano.
 */
export class RepositorioInventario {
  constructor(gateway) {
    this.gateway = gateway
    this.clave = 'inventario'
  }

  async listar() {
    const datos = (await this.gateway.obtener(this.clave)) || []
    const alimentos = []
    for (const d of datos) {
      try {
        alimentos.push(AlimentoFactory.crearAlimento(d.categoria, d))
      } catch (e) {
        console.warn('Registro de inventario invalido, se omite:', d, e.message)
      }
    }
    return alimentos
  }

  async guardar(alimento) {
    const datos = (await this.gateway.obtener(this.clave)) || []
    const idx = datos.findIndex((d) => d.id === alimento.id)
    if (idx >= 0) datos[idx] = alimento.toJSON()
    else datos.push(alimento.toJSON())
    await this.gateway.guardar(this.clave, datos)
    return alimento
  }

  async guardarVarios(alimentos) {
    const datos = (await this.gateway.obtener(this.clave)) || []
    alimentos.forEach((a) => datos.push(a.toJSON()))
    await this.gateway.guardar(this.clave, datos)
    return alimentos
  }

  async eliminar(id) {
    let datos = (await this.gateway.obtener(this.clave)) || []
    datos = datos.filter((d) => d.id !== id)
    await this.gateway.guardar(this.clave, datos)
  }
}
