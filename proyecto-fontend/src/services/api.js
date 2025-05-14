/**
 * @fileoverview Servicio centralizado para manejar todas las llamadas a la API
 * Este archivo contiene todas las funciones para interactuar con el backend
 */

import axios from "axios"

// URL base para todas las llamadas a la API
const BASE_URL = "http://localhost:8080"

/**
 * Cliente axios configurado con la URL base y opciones comunes
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

/**
 * Añade el token de autenticación a las solicitudes si existe
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise} Respuesta con token y datos del usuario
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/login", { email, contrasena: password })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Obtiene el perfil del usuario actual
   * @param {string} email - Email del usuario
   * @returns {Promise} Datos del perfil del usuario
   */
  getProfile: async (email) => {
    try {
      const response = await apiClient.get(`/api/usuario/perfil?email=${email}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Actualiza el nombre del usuario
   * @param {string} email - Email del usuario
   * @param {string} nombre - Nuevo nombre del usuario
   * @returns {Promise} Datos actualizados del usuario
   */
  updateUserName: async (email, nombre) => {
    try {
      const response = await apiClient.put(`/api/usuario/modificar?email=${email}`, { nombre })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

/**
 * Servicio para gestionar almacenes
 */
export const warehouseService = {
  /**
   * Obtiene todos los almacenes
   * @returns {Promise} Lista de almacenes
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/api/almacen")
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Crea un nuevo almacén
   * @param {Object} warehouseData - Datos del almacén a crear
   * @returns {Promise} Datos del almacén creado
   */
  create: async (warehouseData) => {
    try {
      const response = await apiClient.post("/api/almacen", warehouseData)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Elimina un almacén por su ID
   * @param {number} id - ID del almacén a eliminar
   * @returns {Promise} Respuesta de la operación
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/almacen/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

/**
 * Servicio para gestionar estanterías
 */
export const shelfService = {
  /**
   * Obtiene todas las estanterías de un almacén
   * @param {number} warehouseId - ID del almacén
   * @returns {Promise} Lista de estanterías
   */
  getByWarehouse: async (warehouseId) => {
    try {
      const response = await apiClient.get(`/api/estanteria/${warehouseId}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Crea una nueva estantería
   * @param {Object} shelfData - Datos de la estantería a crear
   * @returns {Promise} Datos de la estantería creada
   */
  create: async (shelfData) => {
    try {
      const response = await apiClient.post("/api/estanteria", shelfData)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Actualiza una estantería existente
   * @param {Object} shelfData - Datos actualizados de la estantería
   * @returns {Promise} Datos de la estantería actualizada
   */
  update: async (shelfData) => {
    try {
      const response = await apiClient.put("/api/estanteria", shelfData)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Elimina una estantería por su ID
   * @param {number} id - ID de la estantería a eliminar
   * @returns {Promise} Respuesta de la operación
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/estanteria/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

/**
 * Servicio para gestionar productos
 */
export const productService = {
  /**
   * Obtiene todos los productos
   * @returns {Promise} Lista de productos
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/api/producto")
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Crea un nuevo producto
   * @param {FormData} formData - Datos del producto y su imagen
   * @returns {Promise} Datos del producto creado
   */
  create: async (formData) => {
    try {
      const response = await apiClient.post("/api/producto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Actualiza un producto existente
   * @param {FormData} formData - Datos actualizados del producto
   * @returns {Promise} Datos del producto actualizado
   */
  update: async (formData) => {
    try {
      const response = await apiClient.put("/api/producto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Elimina un producto por su ID
   * @param {number} id - ID del producto a eliminar
   * @returns {Promise} Respuesta de la operación
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/producto/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

/**
 * Servicio para gestionar categorías de productos
 */
export const categoryService = {
  /**
   * Obtiene todas las categorías
   * @returns {Promise} Lista de categorías
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/api/categoria")
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Crea una nueva categoría
   * @param {Object} categoryData - Datos de la categoría a crear
   * @returns {Promise} Datos de la categoría creada
   */
  create: async (categoryData) => {
    try {
      const response = await apiClient.post("/api/categoria", categoryData)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Actualiza una categoría existente
   * @param {Object} categoryData - Datos actualizados de la categoría
   * @returns {Promise} Datos de la categoría actualizada
   */
  update: async (categoryData) => {
    try {
      const response = await apiClient.put("/api/categoria", categoryData)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

/**
 * Servicio para gestionar tareas
 */
export const taskService = {
  /**
   * Obtiene todas las tareas
   * @returns {Promise} Lista de tareas
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/api/tarea")
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Crea una nueva tarea
   * @param {Object} taskData - Datos de la tarea a crear
   * @returns {Promise} Datos de la tarea creada
   */
  create: async (taskData) => {
    try {
      const response = await apiClient.post("/api/tarea", taskData)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Actualiza una tarea existente
   * @param {Object} taskData - Datos actualizados de la tarea
   * @returns {Promise} Datos de la tarea actualizada
   */
  update: async (taskData) => {
    try {
      const response = await apiClient.put("/api/tarea", taskData)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Elimina una tarea por su ID
   * @param {number} id - ID de la tarea a eliminar
   * @returns {Promise} Respuesta de la operación
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/tarea/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

/**
 * Servicio para gestionar categorías de tareas
 */
export const taskCategoryService = {
  /**
   * Obtiene todas las categorías de tareas
   * @returns {Promise} Lista de categorías de tareas
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/api/categoriatarea")
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Crea una nueva categoría de tarea
   * @param {Object} categoryData - Datos de la categoría a crear
   * @returns {Promise} Datos de la categoría creada
   */
  create: async (categoryData) => {
    try {
      const response = await apiClient.post("/api/categoriatarea", categoryData)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Actualiza una categoría de tarea existente
   * @param {number} id - ID de la categoría a actualizar
   * @param {Object} categoryData - Datos actualizados de la categoría
   * @returns {Promise} Datos de la categoría actualizada
   */
  update: async (id, categoryData) => {
    try {
      const response = await apiClient.put(`/api/categoriatarea/${id}`, categoryData)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

/**
 * Servicio para gestionar usuarios
 */
export const userService = {
  /**
   * Obtiene todos los usuarios
   * @returns {Promise} Lista de usuarios
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/api/usuario/admin/listarUsuarios")
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

/**
 * Función para manejar errores de la API de manera consistente
 * @param {Error} error - Error capturado
 * @returns {Error} Error formateado con mensaje descriptivo
 */
function handleApiError(error) {
  let errorMessage = "Error en la solicitud"

  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    errorMessage = `Error ${error.response.status}: ${error.response.data || "Error en el servidor"}`
  } else if (error.request) {
    // La solicitud se realizó pero no se recibió respuesta
    errorMessage = "No se recibió respuesta del servidor"
  } else {
    // Ocurrió un error al configurar la solicitud
    errorMessage = error.message
  }

  console.error("API Error:", errorMessage)
  const formattedError = new Error(errorMessage)
  formattedError.originalError = error
  return formattedError
}

export default {
  authService,
  warehouseService,
  shelfService,
  productService,
  categoryService,
  taskService,
  taskCategoryService,
  userService,
}
