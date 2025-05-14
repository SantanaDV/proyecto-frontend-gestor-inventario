/**
 * @fileoverview Componente de indicador de carga
 * Muestra un spinner animado durante operaciones asíncronas
 */

/**
 * Componente de indicador de carga
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Componente renderizado
 */
export default function LoadingSpinner({ size = "medium", fullScreen = false, message = "Cargando..." }) {
  // Determinar el tamaño del spinner
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  }

  // Componente base del spinner
  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-red-700 ${sizeClasses[size]}`}></div>
      {message && <p className="mt-2 text-gray-600">{message}</p>}
    </div>
  )

  // Si es pantalla completa, centrar en la pantalla
  if (fullScreen) {
    return <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">{spinner}</div>
  }

  return spinner
}
