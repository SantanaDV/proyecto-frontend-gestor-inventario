"use client"

/**
 * @fileoverview Hook personalizado para manejar el almacenamiento local
 * Proporciona funciones para guardar y cargar datos del localStorage
 */

import { useState } from "react"

/**
 * Hook para manejar el almacenamiento local
 * @param {string} key - Clave para almacenar el valor
 * @param {any} initialValue - Valor inicial
 * @returns {Array} Estado y función para actualizar el valor
 */
export function useLocalStorage(key, initialValue) {
  // Obtener el valor inicial del localStorage o usar el valor proporcionado
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error("Error al cargar del localStorage:", error)
      return initialValue
    }
  })

  /**
   * Actualiza el valor en el estado y en localStorage
   * @param {any} value - Nuevo valor o función para calcular el nuevo valor
   */
  const setValue = (value) => {
    try {
      // Permitir que el valor sea una función (como en useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Guardar en el estado
      setStoredValue(valueToStore)

      // Guardar en localStorage
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error("Error al guardar en localStorage:", error)
    }
  }

  /**
   * Elimina el valor del localStorage
   */
  const removeValue = () => {
    try {
      localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error("Error al eliminar del localStorage:", error)
    }
  }

  return [storedValue, setValue, removeValue]
}

export default useLocalStorage
