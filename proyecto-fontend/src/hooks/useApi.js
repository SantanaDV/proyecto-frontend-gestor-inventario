"use client"

/**
 * @fileoverview Hook personalizado para realizar peticiones a la API
 * Versión mejorada del hook original con mejor manejo de errores y estados
 */

import { useState, useEffect, useCallback } from "react"
import axios from "axios"

/**
 * Hook para realizar peticiones a la API
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} options - Opciones de la petición
 * @returns {Object} Estado y funciones para manejar la petición
 */
const useApi = (endpoint, options = {}) => {
  const baseUrl = "http://localhost:8080/"
  const [uri, setUri] = useState(`${baseUrl}${endpoint}`)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentOptions, setCurrentOptions] = useState(options)

  /**
   * Realiza la petición a la API
   * @returns {Promise} Resultado de la petición
   */
  const fetchData = useCallback(async () => {
    if (!uri || !currentOptions) return

    try {
      setLoading(true)
      setError(null)

      const response = await axios({
        url: uri,
        method: currentOptions.method || "GET",
        headers: {
          ...(currentOptions.headers || {}),
        },
        withCredentials: true,
        data: currentOptions.body || undefined,
      })

      setData(response.data)
      return response.data
    } catch (err) {
      console.error("Error durante la petición:", err)

      let errorMessage = "Error en la solicitud"
      if (err.response) {
        errorMessage = `Error ${err.response.status}: ${err.response.data || "Error en el servidor"}`
      } else if (err.request) {
        errorMessage = "No se recibió respuesta del servidor"
      } else {
        errorMessage = err.message
      }

      setError(errorMessage)
      setData(null)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [uri, currentOptions])

  // Ejecutar cuando cambien uri u options
  useEffect(() => {
    fetchData().catch((err) => console.error("Error en useEffect de useApi:", err))
  }, [fetchData])

  /**
   * Actualiza las opciones de la petición
   * @param {Object} newOptions - Nuevas opciones
   */
  const setOptions = useCallback((newOptions) => {
    setCurrentOptions((prev) => ({
      ...prev,
      ...newOptions,
    }))
  }, [])

  return {
    data,
    loading,
    error,
    setUri,
    setError,
    setOptions,
    currentOptions,
    refetch: fetchData,
  }
}

export default useApi
