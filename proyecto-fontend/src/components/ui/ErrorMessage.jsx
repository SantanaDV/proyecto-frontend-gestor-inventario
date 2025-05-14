"use client"

/**
 * @fileoverview Componente para mostrar mensajes de error
 * Muestra un mensaje de error con estilo consistente
 */

/**
 * Componente para mostrar mensajes de error
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Componente renderizado
 */
export default function ErrorMessage({ message, onRetry = null }) {
  if (!message) return null

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{message}</span>

      {onRetry && (
        <div className="mt-2">
          <button
            onClick={onRetry}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}
