import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig.js'

/**
 * Gateway de persistencia usando Firestore.
 * Mantiene la misma interfaz que el anterior LocalStorageGateway.
 */
export class FirestoreGateway {
  constructor(nombreColeccion = 'inventario') {
    this.nombreColeccion = nombreColeccion
    this.coleccionRef = collection(db, nombreColeccion)
  }

  async obtener() {
    const snapshot = await getDocs(this.coleccionRef)
    const datos = []
    snapshot.forEach((doc) => {
      datos.push(doc.data())
    })
    return datos
  }

  async guardar(id, datos) {
    const docRef = doc(db, this.nombreColeccion, id)
    await setDoc(docRef, datos)
    return datos
  }

  async eliminar(id) {
    const docRef = doc(db, this.nombreColeccion, id)
    await deleteDoc(docRef)
  }
}
