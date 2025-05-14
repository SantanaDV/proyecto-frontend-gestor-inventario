"use client"

/**
 * @fileoverview Hook personalizado para manejar la autenticación
 * Proporciona funciones para iniciar sesión, cerrar sesión y verificar el estado de autenticación
 */

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../services/api"

/**
 * Hook para manejar la autenticación de usuarios
 * @returns {Object} Funciones y estados relacionados con la autenticación
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("authToken")
        const email = localStorage.getItem("userEmail")
        const name = localStorage.getItem("userName")

        if (token && email) {
          setUser({
            email,
            name: name || "",
            token,
          })
        }
      } catch (err) {
        console.error("Error verificando autenticación:", err)
        setError("Error al verificar la autenticación")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<boolean>} Éxito de la operación
   */
  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      // Iniciar sesión y obtener token
      const authData = await authService.login(email, password)

      if (!authData || !authData.token) {
        throw new Error("No se recibió un token válido")
      }

      localStorage.setItem("authToken", authData.token)
      localStorage.setItem("userEmail", authData.username)

      // Obtener perfil del usuario
      const profileData = await authService.getProfile(authData.username)

      if (profileData && profileData.nombre) {
        localStorage.setItem("userName", profileData.nombre)
        setUser({
          email: authData.username,
          name: profileData.nombre,
          token: authData.token,
        })
      } else {
        setUser({
          email: authData.username,
          name: "",
          token: authData.token,
        })
      }

      return true
    } catch (err) {
      console.error("Error en inicio de sesión:", err)
      setError(err.message || "Error al iniciar sesión")
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cierra la sesión del usuario actual
   */
  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    setUser(null)
    navigate("/")
  }

  /**
   * Actualiza el nombre del usuario
   * @param {string} newName - Nuevo nombre del usuario
   * @returns {Promise<boolean>} Éxito de la operación
   */
  const updateUserName = async (newName) => {
    if (!user || !user.email) {
      setError("No hay usuario autenticado")
      return false
    }

    setLoading(true)
    try {
      const updatedUser = await authService.updateUserName(user.email, newName)

      if (updatedUser && updatedUser.nombre) {
        localStorage.setItem("userName", updatedUser.nombre)
        setUser({
          ...user,
          name: updatedUser.nombre,
        })
        return true
      }

      throw new Error("No se pudo actualizar el nombre")
    } catch (err) {
      console.error("Error actualizando nombre:", err)
      setError(err.message || "Error al actualizar el nombre")
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    updateUserName,
    isAuthenticated: !!user,
  }
}

export default useAuth
