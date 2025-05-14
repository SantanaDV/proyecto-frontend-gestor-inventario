"use client"

/**
 * @fileoverview Componente de encabezado funcional
 * Muestra botones de acción en la parte superior de las páginas
 */

import { useNavigate } from "react-router-dom"

/**
 * Componente de encabezado funcional
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Componente renderizado
 */
export default function HeaderFuncional({ botones = [], acciones = {} }) {
  const navigate = useNavigate()

  return (
    <section className="bg-red-700 text-white py-4">
      <div className="flex justify-between items-center px-8">
        {botones.length === 0 ? (
          <div className="w-full h-px bg-red-700" />
        ) : (
          <div className="flex gap-4 ml-auto">
            {botones.map((nombre) => (
              <button
                key={nombre}
                onClick={acciones[nombre]}
                className="bg-white text-red-700 border border-red-700 px-4 py-1 rounded font-semibold hover:bg-gray-200 hover:text-red-900 transition-colors"
              >
                {nombre}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
