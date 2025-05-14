"use client"

/**
 * @fileoverview Página de inicio de sesión
 * Permite a los usuarios autenticarse en la aplicación
 */

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "../context/AuthContext"

/**
 * Página de inicio de sesión
 * @returns {JSX.Element} Componente renderizado
 */
function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()
  const { login, isAuthenticated, loading, error } = useAuthContext()

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home")
    }
  }, [isAuthenticated, navigate])

  // Mostrar errores de autenticación
  useEffect(() => {
    if (error) {
      setErrorMessage("Error al iniciar sesión. Por favor verifica tus credenciales.")
    }
  }, [error])

  /**
   * Maneja el envío del formulario de inicio de sesión
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setErrorMessage("Por favor, ingresa tus credenciales.")
      return
    }

    setErrorMessage("")
    const success = await login(email, password)

    if (success) {
      navigate("/home")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-500 font-sans px-4">
      <div className="mb-6">
        <img src="logo.png" alt="Login Header" className="w-60 h-auto rounded-t-2xl" />
      </div>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-[0px_14px_80px_rgba(34,35,58,0.2)] p-10 transition-all">
        <h3 className="text-center text-xl font-semibold mb-6">Iniciar Sesión</h3>

        {errorMessage && (
          <p className="text-center text-sm text-black mt-2 bg-red-300 mb-4 py-4 rounded">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Introduce dirección de correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Introduce tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-700 text-white py-2 rounded-md hover:bg-red-900 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
