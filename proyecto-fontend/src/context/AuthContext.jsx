"use client"

/**
 * @fileoverview Contexto de autenticación para la aplicación
 * Proporciona acceso al estado de autenticación en toda la aplicación
 */

import { createContext, useContext } from "react"
import { useAuth } from "../hooks/useAuth"

// Crear el contexto
const AuthContext = createContext(null)

/**
 * Proveedor del contexto de autenticación
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Proveedor del contexto
 */
export function AuthProvider({ children }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

/**
 * Hook para acceder al contexto de autenticación
 * @returns {Object} Estado y funciones de autenticación
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de un AuthProvider")
  }

  return context
}
