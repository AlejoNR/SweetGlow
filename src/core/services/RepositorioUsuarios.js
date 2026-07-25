import { FirestoreGateway } from '../persistence/FirestoreGateway.js'
import bcrypt from 'bcryptjs'

export class RepositorioUsuarios {
  constructor() {
    this.gateway = new FirestoreGateway('usuarios')
    this.coleccion = 'usuarios'
  }

  async obtenerTodos() {
    return (await this.gateway.obtener(this.coleccion)) || []
  }

  async crearCuenta({ nombre, email, password, rol, estado = 'activo' }) {
    const usuarios = await this.obtenerTodos()
    
    // Exception 1: Username (email) already exists
    const existe = usuarios.find(u => u.email === email)
    if (existe) {
      throw new Error('El correo o nombre de usuario ya esta en uso.')
    }
    
    // Validations (Exception 2: invalid data)
    if (!nombre || !email || !password || !rol) {
      throw new Error('Todos los campos son obligatorios.')
    }
    
    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.')
    }

    // Encrypt password
    const passwordHash = bcrypt.hashSync(password, 10)

    const nuevoUsuario = {
      id: crypto.randomUUID(),
      nombre,
      email,
      password: passwordHash,
      rol,
      estado
    }

    await this.gateway.guardar(nuevoUsuario.id, nuevoUsuario)
    return nuevoUsuario
  }

  async eliminarCuenta(id) {
    const usuarios = await this.obtenerTodos()
    const index = usuarios.findIndex(u => u.id === id)
    if (index === -1) {
      throw new Error('Usuario no encontrado.')
    }
    await this.gateway.eliminar(id)
    return true
  }

  async cambiarEstado(id, nuevoEstado) {
    const usuarios = await this.obtenerTodos()
    const index = usuarios.findIndex(u => u.id === id)
    if (index === -1) {
      throw new Error('Usuario no encontrado.')
    }
    await this.gateway.guardar(id, usuarios[index])
    return true
  }
}
