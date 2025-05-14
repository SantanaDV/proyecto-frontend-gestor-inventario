"use client"

/**
 * @fileoverview Componente para cerrar sesión
 * Elimina el token de autenticación y redirige a la página de login
 */

import { useAuthContext } from "../context/AuthContext"

/**
 * Componente para cerrar sesión
 * @returns {JSX.Element} Componente renderizado
 */
const LogoutButton = () => {
  const { logout } = useAuthContext()

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Cerrar Sesión</h2>
        <p className="mb-6 text-center">¿Estás seguro de que deseas cerrar sesión?</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutButton
