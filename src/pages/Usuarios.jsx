import { useState, useEffect } from 'react'
import { RepositorioUsuarios } from '../core/services/RepositorioUsuarios.js'
import { useSession } from '../context/SessionContext.jsx'

function Usuarios() {
  const { usuario } = useSession()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  
  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'operador',
    estado: 'activo'
  })
  const [guardando, setGuardando] = useState(false)

  const cargarUsuarios = async () => {
    setCargando(true)
    const repo = new RepositorioUsuarios()
    const lista = await repo.obtenerTodos()
    setUsuarios(lista)
    setCargando(false)
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  if (usuario?.rol !== 'admin') {
    return (
      <div className="card p-8 text-center text-critico">
        <h2 className="text-xl font-bold mb-2">Acceso Denegado</h2>
        <p>Solo los administradores pueden gestionar cuentas de usuario.</p>
      </div>
    )
  }

  const handleEliminar = async (idAEliminar, nombre) => {
    if (idAEliminar === usuario.id) {
      alert("No puedes eliminar tu propia cuenta.")
      return
    }
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${nombre}?`)
    if (!confirmar) return

    try {
      const repo = new RepositorioUsuarios()
      await repo.eliminarCuenta(idAEliminar)
      setMensaje({ texto: 'Usuario eliminado correctamente.', tipo: 'exito' })
      cargarUsuarios()
    } catch (error) {
      setMensaje({ texto: error.message, tipo: 'error' })
    }
  }

  const handleCambiarEstado = async (id, estadoActual) => {
    if (id === usuario.id) {
      alert("No puedes cambiar tu propio estado.")
      return
    }
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo'
    try {
      const repo = new RepositorioUsuarios()
      await repo.cambiarEstado(id, nuevoEstado)
      setMensaje({ texto: `Usuario marcado como ${nuevoEstado}.`, tipo: 'exito' })
      cargarUsuarios()
    } catch (error) {
      setMensaje({ texto: error.message, tipo: 'error' })
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCrearUsuario = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setMensaje({ texto: '', tipo: '' })

    try {
      const repo = new RepositorioUsuarios()
      await repo.crearCuenta(formData)
      
      setMensaje({ texto: 'Cuenta creada exitosamente.', tipo: 'exito' })
      setFormData({ nombre: '', email: '', password: '', rol: 'operador', estado: 'activo' })
      setModalAbierto(false)
      cargarUsuarios()
    } catch (error) {
      setMensaje({ texto: error.message, tipo: 'error' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-textDark text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-textMuted text-sm">Administración del personal del sistema</p>
        </div>
        <button 
          onClick={() => setModalAbierto(true)}
          className="btn-primary flex items-center gap-2"
        >
          <i className="fa-solid fa-user-plus"></i> Nuevo Usuario
        </button>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-lg border ${
          mensaje.tipo === 'error' 
            ? 'bg-critico/10 border-critico/20 text-critico' 
            : 'bg-primary/10 border-primary/20 text-primary'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-textMuted">
            <thead className="text-xs text-textDark uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Correo</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="5" className="text-center py-8">Cargando usuarios...</td></tr>
              ) : usuarios.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8">No hay usuarios registrados.</td></tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-textDark">{u.nombre}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4 capitalize">{u.rol}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.estado === 'activo' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleCambiarEstado(u.id, u.estado)}
                        disabled={u.id === usuario.id}
                        className={`${u.estado === 'activo' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'} px-3 py-1.5 rounded-md transition-colors text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed`}
                      >
                        {u.estado === 'activo' ? 'Suspender' : 'Activar'}
                      </button>
                      <button 
                        onClick={() => handleEliminar(u.id, u.nombre)}
                        disabled={u.id === usuario.id}
                        className="text-critico hover:bg-critico/10 px-3 py-1.5 rounded-md transition-colors text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Creación */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-textDark text-lg">Crear Nuevo Usuario</h3>
              <button 
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleCrearUsuario} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-textDark text-xs font-semibold mb-1 uppercase tracking-wide">Nombre Completo</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej. Juan Pérez"
                      className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-textDark text-xs font-semibold mb-1 uppercase tracking-wide">Correo (Usuario)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="usuario@sigi.com"
                      className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-textDark text-xs font-semibold mb-1 uppercase tracking-wide">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimo 6 caracteres"
                    className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    required
                    minLength={6}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-textDark text-xs font-semibold mb-1 uppercase tracking-wide">Rol</label>
                    <select
                      name="rol"
                      value={formData.rol}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    >
                      <option value="admin">Administrador</option>
                      <option value="operador">Operador Bodega</option>
                      <option value="supervisor">Supervisor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-textDark text-xs font-semibold mb-1 uppercase tracking-wide">Estado Inicial</label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="pt-5 mt-2 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="btn-primary"
                  >
                    {guardando ? 'Guardando...' : 'Crear Cuenta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Usuarios
