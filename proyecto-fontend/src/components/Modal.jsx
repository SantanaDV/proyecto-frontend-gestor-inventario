"use client"

/**
 * @fileoverview Componente de modal genérico
 * Muestra un diálogo modal con contenido personalizable
 */

import { useState } from "react"

/**
 * Componente de modal genérico
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Componente renderizado
 */
const Modal = ({ isOpen, onClose, onSubmit, newUserName, setNewUserName }) => {
  const [errorMessage, setErrorMessage] = useState("")

  /**
   * Maneja el clic en el botón de guardar
   */
  const handleClickGuardar = () => {
    if (!newUserName.trim()) {
      setErrorMessage("El nombre no puede estar vacío.")
      return
    }
    setErrorMessage("")
    onSubmit()
    // El padre cerrará el modal al recibir respuesta exitosa
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
        {/* Botón de cerrar */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <h3 className="text-xl font-semibold mb-4">Modificar Nombre de Usuario</h3>

        {errorMessage && <p className="text-sm text-red-500 mb-4">{errorMessage}</p>}

        <div>
          <label htmlFor="newUserName" className="block font-medium mb-2">
            Nuevo Nombre
          </label>
          <input
            id="newUserName"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Introduce tu nuevo nombre"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
          />
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleClickGuardar}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Guardar Cambios
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal
