import { FirestoreGateway } from '../persistence/FirestoreGateway.js'

/**
 * Siembra datos iniciales (usuarios de prueba e inventario de ejemplo)
 * la primera vez que se abre la app. Permite probar el sistema de una vez.
 */
export async function sembrarDatos() {
  // Ya no sembramos datos locales porque usamos Firestore real
  return true;
}
