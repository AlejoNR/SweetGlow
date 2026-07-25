import { CosmeticoRostro } from '../models/CosmeticoRostro.js'
import { CosmeticoOjos } from '../models/CosmeticoOjos.js'
import { CosmeticoLabios } from '../models/CosmeticoLabios.js'
import { CuidadoPiel } from '../models/CuidadoPiel.js'
import { Maquillaje } from '../models/Maquillaje.js'

export class MaquillajeFactory {
  /**
   * Crea una instancia de la subclase correcta segun la categoria.
   */
  static crearProducto(categoria, datos) {
    let producto
    switch (categoria?.toLowerCase()) {
      case 'rostro':
        producto = new CosmeticoRostro(datos)
        break
      case 'ojos':
        producto = new CosmeticoOjos(datos)
        break
      case 'labios':
        producto = new CosmeticoLabios(datos)
        break
      case 'cuidado_piel':
        producto = new CuidadoPiel(datos)
        break
      default:
        // Por defecto lo creamos como CuidadoPiel o una clase génerica anónima
        // Ya que Maquillaje es abstracta
        producto = new (class extends Maquillaje {
          constructor(d) {
            super(d)
            this.categoria = categoria || 'generico'
          }
        })(datos)
    }

    producto.validar()
    return producto
  }
}
