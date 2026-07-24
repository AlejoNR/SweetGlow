import { useState } from 'react'
import { ValidarFormato } from '../../core/auth/ValidarFormato.js'
import { ValidarCredenciales } from '../../core/auth/ValidarCredenciales.js'
import { ValidarEstado } from '../../core/auth/ValidarEstado.js'
import { ValidarRol } from '../../core/auth/ValidarRol.js'
import { LocalStorageGateway } from '../../core/persistence/LocalStorageGateway.js'

/**
 * Construye la cadena de responsabilidad (logica 100% del /core).
 * formato -> credenciales -> estado -> rol
 */
function construirCadenaAuth() {
  const gateway = new LocalStorageGateway()
  const formato = new ValidarFormato()
  const credenciales = new ValidarCredenciales(gateway)
  const estado = new ValidarEstado()
  const rol = new ValidarRol(['admin', 'operador'])

  formato.setSiguiente(credenciales).setSiguiente(estado).setSiguiente(rol)
  return formato
}

function LoginForm({ onLoginExitoso }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const [rolActivo, setRolActivo] = useState('admin')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    // React solo INVOCA el dominio; no contiene reglas de negocio
    const cadena = construirCadenaAuth()
    const resultado = await cadena.manejar({ email: email.trim(), password })

    setCargando(false)
    if (resultado.exito) onLoginExitoso(resultado.data._usuario)
    else setError(resultado.mensaje)
  }

  const seleccionarRol = (rol, correo, pass) => {
    setRolActivo(rol)
    setEmail(correo)
    setPassword(pass)
  }

  return (
    <div className="min-h-screen bg-[#07130F] flex w-full relative font-sans">
      {/* Fondo de grid sutil para el lado izquierdo */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}>
      </div>


      <div className="hidden lg:flex flex-col justify-center items-start pl-24 pr-10 w-1/2 z-10 relative">

        <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(74,222,128,0.15)] backdrop-blur-md">
          <span className="text-primary text-3xl drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">&#127811;</span>
        </div>
        <h1 className="text-text text-3xl font-bold tracking-[0.2em] mb-1">SIGI</h1>
        <p className="text-muted text-[10px] tracking-[0.3em] mb-12 uppercase font-medium">Sistema de gestión de inventario</p>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold tracking-widest mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
          ESTRATEGIA FEFO ACTIVA
        </div>

        <h2 className="text-text text-4xl font-bold mb-6 tracking-tight">SIGI - FreshControl</h2>
        <p className="text-muted text-sm leading-relaxed max-w-md mb-12 opacity-80">
          Monitorea, alerta y gestiona los insumos de tu restaurante con la estrategia First Expire, First Out. Diseñado para el clima de Florencia, Caquetá.
        </p>

        <div className="flex gap-14">
          <div>
            <p className="text-primary text-3xl font-bold mb-1">13</p>
            <p className="text-muted text-[10px] uppercase tracking-widest font-semibold opacity-60">Requerimientos</p>
          </div>
          <div>
            <p className="text-primary text-3xl font-bold mb-1">4</p>
            <p className="text-muted text-[10px] uppercase tracking-widest font-semibold opacity-60">Patrones Diseño</p>
          </div>
          <div>
            <p className="text-primary text-3xl font-bold mb-1">2</p>
            <p className="text-muted text-[10px] uppercase tracking-widest font-semibold opacity-60">Roles de Usuario</p>
          </div>
        </div>
      </div>


      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10 relative">
        <form onSubmit={handleSubmit} className="w-full max-w-[420px] panel p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden bg-[#0A1A14]/90 backdrop-blur-2xl border border-white/5 rounded-3xl">

          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

          <h2 className="text-text text-2xl font-bold mb-1">Bienvenido de vuelta</h2>
          <p className="text-muted text-sm mb-8 opacity-80">Ingresa tus credenciales para continuar</p>

          <div className="mb-8">
            <p className="text-muted text-[10px] font-bold mb-3 tracking-widest uppercase opacity-80">Acceder como</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => seleccionarRol('admin', 'Aldo09300@gmail.com', '123456')}
                className={`flex-1 py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${rolActivo === 'admin' ? 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_15px_rgba(74,222,128,0.1)]' : 'border-white/5 bg-white/5 text-muted hover:bg-white/10'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[11px] font-semibold tracking-wide">Administrador</span>
              </button>
              <button
                type="button"
                onClick={() => seleccionarRol('operador', 'operador@sigi.com', '123456')}
                className={`flex-1 py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${rolActivo === 'operador' ? 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_15px_rgba(74,222,128,0.1)]' : 'border-white/5 bg-white/5 text-muted hover:bg-white/10'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                </svg>
                <span className="text-[11px] font-semibold tracking-wide">Personal Cocina</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-critico/10 border border-critico/30 text-critico text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-muted text-[10px] font-bold mb-2 uppercase tracking-widest opacity-80">Usuario</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setRolActivo(null); }}
                placeholder="admin@restaurante.com"
                className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 text-text text-sm rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all placeholder:text-muted/30"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-muted text-[10px] font-bold mb-2 uppercase tracking-widest opacity-80">Contraseña</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 text-text text-sm rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all placeholder:text-muted/30"
              />
            </div>
          </div>

          <button type="submit" disabled={cargando} className="w-full py-3.5 bg-primary/90 hover:bg-primary text-[#07130F] rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_25px_rgba(74,222,128,0.4)] disabled:opacity-70 disabled:cursor-not-allowed">
            {cargando ? 'Validando...' : (
              <>
                Ingresar al sistema
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <a href="#" className="text-[11px] text-muted/70 hover:text-primary transition-colors underline decoration-white/10 underline-offset-4 hover:decoration-primary/50">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

        </form>

        <p className="absolute bottom-8 text-center text-muted/30 text-[9px] tracking-[0.3em] uppercase font-bold">
          SIGI V1.0 - UNIAMAZONIA - 2026-1
        </p>
      </div>
    </div>
  )
}

export default LoginForm
