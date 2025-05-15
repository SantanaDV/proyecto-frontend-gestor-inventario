/**
 * @fileoverview Utilidad para la comunicación con la API del sistema.
 * Proporciona funciones para realizar peticiones HTTP a los diferentes endpoints de la API.
 *
 * @module apiComunicator
 * @requires axios
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"

/**
 * Realiza una petición GET a la API.
 *
 * @async
 * @function get
 * @param {string} endpoint - Ruta del endpoint a consultar
 * @param {Object} [params={}] - Parámetros de consulta (query params)
 * @param {Object} [headers={}] - Cabeceras HTTP adicionales
 * @returns {Promise<Object>} Datos obtenidos de la API
 * @throws {Error} Si ocurre un error en la petición
 */

/**
 * Realiza una petición POST a la API.
 *
 * @async
 * @function post
 * @param {string} endpoint - Ruta del endpoint
 * @param {Object} data - Datos a enviar en el cuerpo de la petición
 * @param {Object} [headers={}] - Cabeceras HTTP adicionales
 * @returns {Promise<Object>} Respuesta de la API
 * @throws {Error} Si ocurre un error en la petición
 */

/**
 * Realiza una petición PUT a la API.
 *
 * @async
 * @function put
 * @param {string} endpoint - Ruta del endpoint
 * @param {Object} data - Datos a enviar en el cuerpo de la petición
 * @param {Object} [headers={}] - Cabeceras HTTP adicionales
 * @returns {Promise<Object>} Respuesta de la API
 * @throws {Error} Si ocurre un error en la petición
 */

/**
 * Realiza una petición DELETE a la API.
 *
 * @async
 * @function del
 * @param {string} endpoint - Ruta del endpoint
 * @param {Object} [headers={}] - Cabeceras HTTP adicionales
 * @returns {Promise<Object>} Respuesta de la API
 * @throws {Error} Si ocurre un error en la petición
 */

const useApi = (endpoint, options = {}) => {
  const baseUrl = "http://localhost:8080/"
  const [uri, setUri] = useState(`${baseUrl}${endpoint}`)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentOptions, setCurrentOptions] = useState(options)

  // Función fetchData fuera del useEffect
  const fetchData = useCallback(async () => {
    if (!uri || !currentOptions) return

    try {
      setLoading(true)
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
      setError(null)
    } catch (err) {
      console.error("Error during request:", err)
      if (err.response) {
        setError(`Error ${err.response.status}: ${err.response.data}`)
      } else if (err.request) {
        setError("No response received from the server")
      } else {
        setError(err.message)
      }
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [uri, currentOptions])

  // Ejecutar cuando cambien uri u options
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    setUri,
    setError,
    setOptions: setCurrentOptions,
    currentOptions,
    refetch: fetchData, // Exponemos la función
  }
}

export default useApi