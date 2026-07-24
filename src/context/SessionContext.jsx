import { createContext, useContext, useState } from 'react'

/**
 * Context MINIMO: guarda unicamente el usuario logueado (estado de UI).
 * NO contiene logica de patrones ni reglas de negocio: esas viven en /core.
 */
const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const login = (u) => setUsuario(u)
  const logout = () => setUsuario(null)
  return (
    <SessionContext.Provider value={{ usuario, login, logout }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => useContext(SessionContext)
