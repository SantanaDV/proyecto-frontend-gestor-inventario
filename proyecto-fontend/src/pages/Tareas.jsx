"use client"

/**
 * @fileoverview Página de gestión de tareas que permite visualizar y administrar las tareas del sistema.
 * Proporciona funcionalidades para crear, editar, completar y eliminar tareas.
 *
 * @component Tareas
 * @requires React
 * @requires react-router-dom
 * @requires ../utilities/apiComunicator
 * @requires ../components/ui/LoadingSpinner
 * @requires ../components/ui/ErrorMessage
 * @requires ../components/ui/card
 */

/**
 * @fileoverview Página de gestión de tareas
 * Permite crear, asignar, editar y filtrar tareas
 */

import { useState, useEffect } from "react"
import useApi from "../utilities/apiComunicator"
import HeaderFuncional from "../components/HeaderFuncional"
import { useNavigate } from "react-router-dom"

/**
 * Página principal de gestión de tareas.
 * Muestra las tareas organizadas por estado (pendientes, en progreso, completadas)
 * y permite realizar operaciones sobre ellas.
 *
 * @returns {JSX.Element} Página completa de tareas con sus diferentes secciones y controles
 */
export default function Tareas() {
  // Hooks para comunicación con la API
  const { data, loading, error, setUri, setError, setOptions } = useApi("api/tarea", {})
  const {
    data: categoriasData,
    loading: loadingCategorias,
    error: errorCategorias,
    setUri: setUriCategorias,
    setError: setErrorCategorias,
  } = useApi("api/categoriatarea", {})

  const {
    data: empleadosData,
    loading: loadingEmpleados,
    error: errorEmpleados,
    setUri: setUriEmpleados,
    setError: setErrorEmpleados,
  } = useApi("api/usuario/admin/listarUsuarios", {})

  useEffect(() => {
    if (Array.isArray(empleadosData)) setEmpleadosDisponibles(empleadosData)
    else if (empleadosData) setErrorEmpleados("Los datos de empleados no son válidos")
  }, [empleadosData, setErrorEmpleados])

  const [categoriaInput, setCategoriaInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([])
  const [isModalCategoriasOpen, setIsModalCategoriasOpen] = useState(false)
  const [isEditCategoriaOpen, setIsEditCategoriaOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [parsedData, setParsedData] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newTask, setNewTask] = useState({
    id: "",
    descripcion: "",
    estado: "Por hacer",
    empleado_asignado: "",
    fecha_asignacion: new Date().toISOString().split("T")[0],
    id_categoria: "",
  })
  const [filters, setFilters] = useState({ empleado: "", fecha: "" })
  const [selectedTask, setSelectedTask] = useState(null)
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState([])
  const [isModalOpenAsignar, setIsModalOpenAsignar] = useState(false)
  const navigate = useNavigate()

  const [pagePorHacer, setPagePorHacer] = useState(0)
  const [pageEnProceso, setPageEnProceso] = useState(0)
  const [pageFinalizadas, setPageFinalizadas] = useState(0)
  const itemsPerPage = 4

  useEffect(() => {
    if (!localStorage.getItem("authToken")) navigate("/")
  }, [navigate])

  useEffect(() => {
    if (Array.isArray(categoriasData)) setCategorias(categoriasData)
    else if (categoriasData) setErrorCategorias("Los datos de categoría no son válidos")
  }, [categoriasData, setErrorCategorias])

  useEffect(() => {
    if (Array.isArray(empleadosData)) setEmpleadosDisponibles(empleadosData)
    else if (empleadosData) setErrorEmpleados("Los datos de empleados no son válidos")
  }, [empleadosData, setErrorEmpleados])

  useEffect(() => {
    if (!data) return
    if (Array.isArray(data)) setParsedData(data)
    else setError("Los datos no son válidos")
  }, [data, setError])

  // Modificar la función para mostrar el nombre del empleado en lugar del ID
  useEffect(() => {
    if (!data) return
    if (Array.isArray(data)) {
      // Procesar los datos para reemplazar el ID del empleado con su nombre
      const processedData = data.map((tarea) => {
        // Si empleadosDisponibles está cargado, buscar el nombre del empleado
        if (empleadosDisponibles.length > 0) {
          const empleado = empleadosDisponibles.find((e) => e.id_usuario === tarea.empleado_asignado)
          if (empleado) {
            return {
              ...tarea,
              empleado_asignado: empleado.nombre,
            }
          }
        }
        return tarea
      })
      setParsedData(processedData)
    } else {
      setError("Los datos no son válidos")
    }
  }, [data, empleadosDisponibles, setError])

  const getStatusColor = (estado) => {
    switch (estado) {
      case "Por hacer":
        return "text-red-500"
      case "En Proceso":
        return "text-yellow-500"
      case "Finalizada":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  const filteredTasks = parsedData.filter(
    (tarea) =>
      (filters.empleado === "" || tarea.empleado_asignado.toLowerCase().includes(filters.empleado.toLowerCase())) &&
      (filters.fecha === "" || tarea.fecha_asignacion === filters.fecha),
  )

  const tasksPorHacer = filteredTasks.filter((t) => t.estado === "Por hacer")
  const tasksEnProceso = filteredTasks.filter((t) => t.estado === "En Proceso")
  const tasksFinalizadas = filteredTasks.filter((t) => t.estado === "Finalizada")
  const tasksSinAsignar = parsedData.filter((t) => !t.empleado_asignado || t.empleado_asignado === "Sin asignar")

  const paginatedPorHacer = tasksPorHacer.slice(pagePorHacer * itemsPerPage, (pagePorHacer + 1) * itemsPerPage)
  const paginatedEnProceso = tasksEnProceso.slice(pageEnProceso * itemsPerPage, (pageEnProceso + 1) * itemsPerPage)
  const paginatedFinalizadas = tasksFinalizadas.slice(
    pageFinalizadas * itemsPerPage,
    (pageFinalizadas + 1) * itemsPerPage,
  )

  const handleModalOpenCategorias = () => {
    setIsModalCategoriasOpen(true)
  }

  const handleCategoriaSeleccionada = (categoria) => {
    console.log("Categoría seleccionada:", categoria)
    setCategoriaInput(categoria.descripcion)
    setSelectedCategoria({ ...categoria })
    setIsEditCategoriaOpen(true)
  }

  const filteredCategorias = categorias.filter((c) =>
    c.descripcion.toLowerCase().includes(categoriaInput.toLowerCase()),
  )

  // Maneja cambios en el input: actualiza texto y resetea la categoría seleccionada
  const handleCategoriaInputChange = (event) => {
    console.log(event.target.value)
    const value = event.target.value
    setCategoriaInput(value)

    // Filter categories based on input
    if (value) {
      const filtered = categorias.filter((cat) => cat.descripcion.toLowerCase().includes(value.toLowerCase()))
      setCategoriasFiltradas(filtered)
    } else {
      setCategoriasFiltradas([])
    }
  }

  // Cuando el usuario selecciona una categoría de la lista
  const handleCategoriaSelect = (categoriaObj) => {
    setNewTask((prev) => ({
      ...prev,
      id_categoria: categoriaObj.id,
    }))
    setCategoriaInput(categoriaObj.descripcion)
    setShowSuggestions(false)
  }

  // Cuando el usuario opta por crear una nueva categoría
  const handleCrearNuevaCategoria = async () => {
    // Verificamos que el input no esté vacío antes de hacer la solicitud
    if (!categoriaInput.trim()) {
      alert("Por favor, ingresa una descripción válida para la categoría.")
      return
    }

    // Verificar si ya existe una categoría con el mismo nombre
    const categoriaExistente = categorias.find((cat) => cat.descripcion.toLowerCase() === categoriaInput.toLowerCase())

    if (categoriaExistente) {
      // Si ya existe, usamos esa categoría en lugar de crear una nueva
      setNewTask((prev) => ({
        ...prev,
        id_categoria: categoriaExistente.id,
      }))
      setCategoriaInput(categoriaExistente.descripcion)
      setShowSuggestions(false)
      return
    }

    try {
      const nuevaCategoria = {
        descripcion: categoriaInput,
      }

      // Hacemos la solicitud POST a la API
      const response = await fetch("http://localhost:8080/api/categoriatarea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaCategoria),
      })

      if (!response.ok) {
        throw new Error("Error en la solicitud")
      }

      const data = await response.json()

      // Actualizar la lista de categorías
      setCategorias([...categorias, data])

      // Actualizar la tarea con la nueva categoría
      setNewTask((prev) => ({
        ...prev,
        id_categoria: data.id,
      }))

      setShowSuggestions(false)
    } catch (error) {
      console.error("Error al crear la categoría:", error)
      alert("Error al crear la categoría. Inténtalo de nuevo.")
    }
  }

  const handleSaveCategoria = async () => {
    try {
      if (!selectedCategoria || !selectedCategoria.descripcion.trim()) {
        alert("La descripción de la categoría no puede estar vacía")
        return
      }
      const response = await fetch(`http://localhost:8080/api/categoriatarea/${selectedCategoria.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descripcion: categoriaInput,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar la categoría")
      }

      const categoriaActualizada = await response.json()

      const nuevasCategorias = categorias.map((cat) => (cat.id === selectedCategoria.id ? categoriaActualizada : cat))
      setCategorias(nuevasCategorias)
      setIsEditCategoriaOpen(false)
    } catch (error) {
      console.error("Error al guardar en la base de datos:", error)
      alert("No se pudo guardar la categoría. Intenta de nuevo.")
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedTask(null)
    setIsEditing(false)
  }

  const handleModalOpen = () => {
    const newId = parsedData.length ? Math.max(...parsedData.map((t) => t.id)) + 1 : 1
    setNewTask({
      id: newId,
      descripcion: "",
      estado: "Por hacer",
      empleado_asignado: "",
      fecha_asignacion: new Date().toISOString().split("T")[0],
      id_categoria: "",
    })
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleEdit = (tarea) => {
    setNewTask({
      ...tarea,
      fecha_asignacion: tarea.fecha_asignacion.split("T")[0],
    })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTask((prev) => ({ ...prev, [name]: value }))
  }

  // Modificar la función handleSaveTask para actualizar correctamente la tarea
  const handleSaveTask = async () => {
    if (!newTask.descripcion.trim()) {
      alert("La descripción de la tarea es obligatoria")
      return
    }

    if (!newTask.id_categoria) {
      alert("Debes seleccionar una categoría")
      return
    }

    try {
      // Preparar los datos de la tarea
      const tareaData = {
        ...newTask,
        id: isEditing ? newTask.id : null,
      }

      // Enviar la solicitud
      const response = await fetch("http://localhost:8080/api/tarea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tareaData),
      })

      if (!response.ok) {
        throw new Error("Error al guardar la tarea")
      }

      const savedTask = await response.json()

      // Actualizar la lista de tareas
      if (isEditing) {
        setParsedData((prevData) => prevData.map((t) => (t.id === newTask.id ? savedTask : t)))
      } else {
        setParsedData((prevData) => [...prevData, savedTask])
      }

      // Cerrar el modal y limpiar el formulario
      setIsModalOpen(false)
      setIsEditing(false)
      setCategoriaInput("")
      setNewTask({
        id: "",
        descripcion: "",
        estado: "Por hacer",
        empleado_asignado: "",
        fecha_asignacion: new Date().toISOString().split("T")[0],
        id_categoria: "",
      })

      alert(isEditing ? "Tarea actualizada con éxito" : "Tarea creada con éxito")
    } catch (error) {
      console.error("Error:", error)
      alert("Error al guardar la tarea: " + error.message)
    }
  }

  const handleModalOpenAsignar = () => setIsModalOpenAsignar(true)

  const handleTareaSeleccionadaAsignar = (tarea) => setSelectedTask(tarea)

  const handleSaveAsignacion = async () => {
    if (!selectedTask || !newTask.empleado_asignado) {
      alert("Debes seleccionar una tarea y un empleado")
      return
    }

    try {
      // Obtener la tarea actual para mantener sus datos
      const tareaActualizada = {
        ...selectedTask,
        empleado_asignado: newTask.empleado_asignado,
      }

      const response = await fetch("http://localhost:8080/api/tarea", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tareaActualizada),
      })

      if (!response.ok) {
        throw new Error("Error al asignar la tarea")
      }

      // Actualizar la lista de tareas
      setParsedData((prevData) => prevData.map((tarea) => (tarea.id === selectedTask.id ? tareaActualizada : tarea)))

      alert("Tarea asignada correctamente")
      setIsModalOpenAsignar(false)
      setSelectedTask(null)
      setNewTask({
        id: "",
        descripcion: "",
        estado: "Por hacer",
        empleado_asignado: "",
        fecha_asignacion: new Date().toISOString().split("T")[0],
        id_categoria: "",
      })
    } catch (error) {
      console.error("Error:", error)
      alert("Error al asignar la tarea: " + error.message)
    }
  }

  // Modificar la función handleTareaSeleccionada para actualizar correctamente el estado
  const handleTareaSeleccionada = (tarea) => {
    setSelectedTask(tarea)
    setNewTask((prev) => ({
      ...prev,
      id: tarea.id,
      descripcion: tarea.descripcion,
      estado: tarea.estado,
      fecha_asignacion: tarea.fecha_asignacion.split("T")[0],
      id_categoria: tarea.id_categoria,
    }))
  }

  const handlePageChange = (page, setPage, totalLength) => {
    if (page >= 0 && page < Math.ceil(totalLength / itemsPerPage)) {
      setPage(page)
    }
  }

  const handleDelete = (tarea) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta tarea?")
    if (confirmDelete) {
      const id_tarea = tarea.id
      const token = localStorage.getItem("authToken")
      // Hacer la solicitud DELETE al backend
      fetch(`http://localhost:8080/api/tarea/${id_tarea}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // Añadir el token en los headers
        },
      })
        .then((response) => {
          if (response.ok) {
            // Actualizar el estado para eliminar la tarea de la lista
            setParsedData((prevData) => prevData.filter((t) => t.id !== id_tarea))
            alert("Tarea eliminada con éxito")
          } else {
            alert("Error al eliminar la tarea")
          }
        })
        .catch((error) => {
          console.error("Error al eliminar la tarea:", error)
          alert("Hubo un error al eliminar la tarea")
        })
    }
  }

  return (
    <>
      <HeaderFuncional
        botones={["Añadir", "Editar Categoría", "Asignar Usuario", "Calendario"]}
        acciones={{
          Añadir: handleModalOpen,
          "Editar Categoría": handleModalOpenCategorias,
          "Asignar Usuario": handleModalOpenAsignar,
          Calendario: () => navigate("/calendario"),
        }}
      />

      <div className="p-6">
        {/* Modal de Añadir / Editar */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-1/3">
              <h3 className="text-2xl mb-4 text-center">{isEditing ? "Editar Tarea" : "Añadir Tarea"}</h3>
              {/* Campos del formulario */}
              <div className="mb-4">
                <label className="block text-sm font-medium">ID</label>
                <input
                  type="text"
                  name="id"
                  value={newTask.id}
                  readOnly
                  className="border p-2 rounded w-full bg-red-200 cursor-not-allowed"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Descripción</label>
                <input
                  type="text"
                  name="descripcion"
                  value={newTask.descripcion}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className="mb-4">
                {/* Campo de entrada para categoría con autocompletar */}
                <div className="form-group">
                  <label className="block text-sm font-medium">Categoría</label>
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    placeholder="Buscar o crear categoría..."
                    value={categoriaInput}
                    onChange={handleCategoriaInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                    required
                  />
                  {showSuggestions && (
                    <ul className="absolute bg-white border border-gray-300 mt-1 max-h-40 overflow-auto z-10 w-[calc(100%-3rem)]">
                      {filteredCategorias.length > 0 ? (
                        filteredCategorias.map((c) => (
                          <li
                            key={c.id}
                            onMouseDown={() => handleCategoriaSelect(c)}
                            className="cursor-pointer px-2 py-1 hover:bg-gray-200"
                          >
                            {`${c.descripcion} (ID: ${c.id})`}
                          </li>
                        ))
                      ) : categoriaInput ? (
                        <li
                          onMouseDown={handleCrearNuevaCategoria}
                          className="cursor-pointer px-2 py-1 hover:bg-gray-200 text-blue-600"
                        >
                          {`Crear nueva categoría "${categoriaInput}"`}
                        </li>
                      ) : (
                        <li className="px-2 py-1 text-gray-500">Escribe para buscar o crear</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Empleado Asignado</label>
                <select
                  name="empleado_asignado"
                  value={newTask.empleado_asignado}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="">Selecciona un empleado</option>
                  {empleadosData.map((empleado) => (
                    <option key={empleado.id_usuario} value={empleado.id_usuario}>
                      {empleado.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Estado</label>
                <select
                  name="estado"
                  value={newTask.estado}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                >
                  <option value="Por hacer">Por hacer</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Finalizada">Finalizada</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Fecha de Asignación</label>
                <input
                  type="date"
                  name="fecha_asignacion"
                  value={newTask.fecha_asignacion}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleModalClose}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveTask}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}