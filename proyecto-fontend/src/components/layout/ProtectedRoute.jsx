/**
 * @fileoverview Componente para proteger rutas que requieren autenticación
 * Redirige a la página de login si el usuario no está autenticado
 */

import { Navigate, useLocation } from "react-router-dom"
import { useAuthContext } from "../../context/AuthContext"

/**
 * Componente para proteger rutas que requieren autenticación
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Componente renderizado
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthContext()
  const location = useLocation()

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
      </div>
    )
  }

  // Redirigir a la página de login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // Renderizar el contenido protegido si está autenticado
  return children
}

export default ProtectedRoute
