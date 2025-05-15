"use client"

// Importaciones de React y hooks personalizados
import { useState, useEffect } from "react"
import useApi from "../utilities/apiComunicator"
import HeaderFuncional from "../components/HeaderFuncional"
import { useNavigate } from "react-router-dom"

// Componente principal para la gestión de tareas
export default function Tareas() {
  // Hook para obtener tareas desde la API
  const { data, loading, error, setUri, setError, setOptions } = useApi("api/tarea", {})

  // Estados para el autocompletado de categorías
  const [categoriaInput, setCategoriaInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([])

  // Hook para obtener categorías de tareas desde la API
  const {
    data: categoriasData,
    loading: loadingCategorias,
    error: errorCategorias,
    setUri: setUriCategorias,
    setError: setErrorCategorias,
  } = useApi("api/categoriatarea", {})

  // Hook para obtener empleados desde la API
  const {
    data: empleadosData,
    loading: loadingEmpleados,
    error: errorEmpleados,
    setUri: setUriEmpleados,
    setError: setErrorEmpleados,
  } = useApi("api/usuario/admin/listarUsuarios", {})

  // Efecto para validar y guardar empleados disponibles
  useEffect(() => {
    if (Array.isArray(empleadosData)) setEmpleadosDisponibles(empleadosData)
    else if (empleadosData) setErrorEmpleados("Los datos de empleados no son válidos")
  }, [empleadosData, setErrorEmpleados])

  // Estados para modales y datos de categorías
  const [isModalCategoriasOpen, setIsModalCategoriasOpen] = useState(false)
  const [isEditCategoriaOpen, setIsEditCategoriaOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [parsedData, setParsedData] = useState([])

  // Estados para el modal de tareas y edición
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

  // Estados para filtros, selección y empleados
  const [filters, setFilters] = useState({ empleado: "", fecha: "" })
  const [selectedTask, setSelectedTask] = useState(null)
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState([])
  const [isModalOpenAsignar, setIsModalOpenAsignar] = useState(false)
  const navigate = useNavigate()

  // Estados para paginación
  const [pagePorHacer, setPagePorHacer] = useState(0)
  const [pageEnProceso, setPageEnProceso] = useState(0)
  const [pageFinalizadas, setPageFinalizadas] = useState(0)
  const itemsPerPage = 4

  // Redirección si no hay token de autenticación
  useEffect(() => {
    if (!localStorage.getItem("authToken")) navigate("/")
  }, [navigate])

  // Guardar categorías obtenidas de la API
  useEffect(() => {
    if (Array.isArray(categoriasData)) setCategorias(categoriasData)
    else if (categoriasData) setErrorCategorias("Los datos de categoría no son válidos")
  }, [categoriasData, setErrorCategorias])

  // Guardar empleados obtenidos de la API
  useEffect(() => {
    if (Array.isArray(empleadosData)) setEmpleadosDisponibles(empleadosData)
    else if (empleadosData) setErrorEmpleados("Los datos de empleados no son válidos")
  }, [empleadosData, setErrorEmpleados])

  // Guardar tareas obtenidas de la API
  useEffect(() => {
    if (!data) return
    if (Array.isArray(data)) setParsedData(data)
    else setError("Los datos no son válidos")
  }, [data, setError])

  // Procesar tareas para mostrar el nombre del empleado asignado
  useEffect(() => {
    if (!data) return
    if (Array.isArray(data)) {
      const processedData = data.map((tarea) => {
        if (empleadosDisponibles.length > 0 && tarea.empleado_asignado && tarea.empleado_asignado !== "Sin asignar") {
          const empleado = empleadosDisponibles.find((e) => e.id_usuario === tarea.empleado_asignado)
          if (empleado) {
            return {
              ...tarea,
              empleado_asignado: empleado.nombre,
            }
          }
        }
        if (!tarea.empleado_asignado || tarea.empleado_asignado === "") {
          return {
            ...tarea,
            empleado_asignado: "Sin asignar",
          }
        }
        return tarea
      })
      setParsedData(processedData)
    } else {
      setError("Los datos no son válidos")
    }
  }, [data, empleadosDisponibles, setError])

  // Devuelve la clase de color según el estado de la tarea
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

  // Filtrado de tareas por empleado y fecha
  const filteredTasks = parsedData.filter((tarea) => {
    const empleadoMatch =
      filters.empleado === "" ||
      (tarea.empleado_asignado &&
        typeof tarea.empleado_asignado === "string" &&
        tarea.empleado_asignado.toLowerCase().includes(filters.empleado.toLowerCase()))
    const fechaMatch = filters.fecha === "" || tarea.fecha_asignacion === filters.fecha
    return empleadoMatch && fechaMatch
  })

  // Separación de tareas por estado
  const tasksPorHacer = filteredTasks.filter((t) => t.estado === "Por hacer")
  const tasksEnProceso = filteredTasks.filter((t) => t.estado === "En Proceso")
  const tasksFinalizadas = filteredTasks.filter((t) => t.estado === "Finalizada")
  const tasksSinAsignar = parsedData.filter(
    (t) =>
      !t.empleado_asignado ||
      t.empleado_asignado === "" ||
      t.empleado_asignado === "Sin asignar" ||
      t.empleado_asignado === null,
  )

  // Paginación de tareas
  const paginatedPorHacer = tasksPorHacer.slice(pagePorHacer * itemsPerPage, (pagePorHacer + 1) * itemsPerPage)
  const paginatedEnProceso = tasksEnProceso.slice(pageEnProceso * itemsPerPage, (pageEnProceso + 1) * itemsPerPage)
  const paginatedFinalizadas = tasksFinalizadas.slice(
    pageFinalizadas * itemsPerPage,
    (pageFinalizadas + 1) * itemsPerPage,
  )

  // Abrir modal de categorías
  const handleModalOpenCategorias = () => {
    setIsModalCategoriasOpen(true)
  }

  // Seleccionar categoría para editar
  const handleCategoriaSeleccionada = (categoria) => {
    setCategoriaInput(categoria.descripcion)
    setSelectedCategoria({ ...categoria })
    setIsEditCategoriaOpen(true)
  }

  // Filtrar categorías por input
  const filteredCategorias = categorias.filter((c) =>
    c.descripcion.toLowerCase().includes(categoriaInput.toLowerCase()),
  )

  // Manejar cambios en el input de categoría
  const handleCategoriaInputChange = (event) => {
    const value = event.target.value
    setCategoriaInput(value)
    if (value) {
      const filtered = categorias.filter((cat) => cat.descripcion.toLowerCase().includes(value.toLowerCase()))
      setCategoriasFiltradas(filtered)
    } else {
      setCategoriasFiltradas([])
    }
  }

  // Seleccionar una categoría de la lista
  const handleCategoriaSelect = (categoriaObj) => {
    setNewTask((prev) => ({
      ...prev,
      id_categoria: categoriaObj.id,
    }))
    setCategoriaInput(categoriaObj.descripcion)
    setShowSuggestions(false)
  }

  // Crear una nueva categoría si no existe
  const handleCrearNuevaCategoria = async () => {
    if (!categoriaInput.trim()) {
      alert("Por favor, ingresa una descripción válida para la categoría.")
      return
    }
    const categoriaExistente = categorias.find((cat) => cat.descripcion.toLowerCase() === categoriaInput.toLowerCase())
    if (categoriaExistente) {
      setNewTask((prev) => ({
        ...prev,
        id_categoria: categoriaExistente.id,
      }))
      setCategoriaInput(categoriaExistente.descripcion)
      setShowSuggestions(false)
      return
    }
    try {
      const nuevaCategoria = { descripcion: categoriaInput }
      const response = await fetch("http://localhost:8080/api/categoriatarea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaCategoria),
      })
      if (!response.ok) throw new Error("Error en la solicitud")
      const data = await response.json()
      setCategorias([...categorias, data])
      setNewTask((prev) => ({
        ...prev,
        id_categoria: data.id,
      }))
      setShowSuggestions(false)
    } catch (error) {
      alert("Error al crear la categoría. Inténtalo de nuevo.")
    }
  }

  // Guardar cambios en una categoría editada
  const handleSaveCategoria = async () => {
    try {
      if (!selectedCategoria || !selectedCategoria.descripcion.trim()) {
        alert("La descripción de la categoría no puede estar vacía")
        return
      }
      const response = await fetch(`http://localhost:8080/api/categoriatarea/${selectedCategoria.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion: categoriaInput }),
      })
      if (!response.ok) throw new Error("Error al guardar la categoría")
      const categoriaActualizada = await response.json()
      const nuevasCategorias = categorias.map((cat) => (cat.id === selectedCategoria.id ? categoriaActualizada : cat))
      setCategorias(nuevasCategorias)
      setIsEditCategoriaOpen(false)
    } catch (error) {
      alert("No se pudo guardar la categoría. Intenta de nuevo.")
    }
  }

  // Cambiar filtros de búsqueda
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  // Cerrar modal de tarea
  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedTask(null)
    setIsEditing(false)
  }

  // Abrir modal para añadir tarea
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

  // Editar tarea existente
  const handleEdit = (tarea) => {
    setNewTask({
      ...tarea,
      fecha_asignacion: tarea.fecha_asignacion.split("T")[0],
    })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  // Cambios en los campos del formulario de tarea
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTask((prev) => ({ ...prev, [name]: value }))
  }

  // Guardar tarea nueva o editada
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
      const tareaData = { ...newTask, id: isEditing ? newTask.id : null }
      const response = await fetch("http://localhost:8080/api/tarea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tareaData),
      })
      if (!response.ok) throw new Error("Error al guardar la tarea")
      const savedTask = await response.json()
      if (isEditing) {
        setParsedData((prevData) => prevData.map((t) => (t.id === newTask.id ? savedTask : t)))
      } else {
        setParsedData((prevData) => [...prevData, savedTask])
      }
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
      alert("Error al guardar la tarea: " + error.message)
    }
  }

  // Abrir modal para asignar usuario
  const handleModalOpenAsignar = () => setIsModalOpenAsignar(true)

  // Seleccionar tarea para asignar usuario
  const handleTareaSeleccionadaAsignar = (tarea) => setSelectedTask(tarea)

  // Guardar asignación de usuario a tarea
  const handleSaveAsignacion = async () => {
    if (!selectedTask || !newTask.empleado_asignado) {
      alert("Debes seleccionar una tarea y un empleado")
      return
    }
    try {
      const tareaActualizada = {
        ...selectedTask,
        empleado_asignado: newTask.empleado_asignado,
      }
      const response = await fetch("http://localhost:8080/api/tarea", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tareaActualizada),
      })
      if (!response.ok) throw new Error("Error al asignar la tarea")
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
      alert("Error al asignar la tarea: " + error.message)
    }
  }

  // Seleccionar tarea para editar
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

  // Cambiar página de la paginación
  const handlePageChange = (page, setPage, totalLength) => {
    if (page >= 0 && page < Math.ceil(totalLength / itemsPerPage)) {
      setPage(page)
    }
  }

  // Eliminar tarea
  const handleDelete = (tarea) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta tarea?")
    if (confirmDelete) {
      const id_tarea = tarea.id
      const token = localStorage.getItem("authToken")
      fetch(`http://localhost:8080/api/tarea/${id_tarea}`, {
        method: "DELETE",
        headers: {
          Authorization: ` Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            setParsedData((prevData) => prevData.filter((t) => t.id !== id_tarea))
            alert("Tarea eliminada con éxito")
          } else {
            alert("Error al eliminar la tarea")
          }
        })
        .catch(() => {
          alert("Hubo un error al eliminar la tarea")
        })
    }
  }

  // Renderizado del componente
  return (
    <>
      {/* Header funcional con botones de acción */}
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
        {/* Modal de Añadir / Editar tarea */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-1/3">
              <h3 className="text-2xl mb-4 text-center">{isEditing ? "Editar Tarea" : "Añadir Tarea"}</h3>
              {/* Formulario de tarea */}
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
                {/* Autocompletado de categoría */}
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
                  required
                />
              </div>
              <div className="flex justify-between">
                <button onClick={handleModalClose} className="bg-red-300 text-black px-4 py-2 rounded">
                  Cancelar
                </button>
                <button onClick={handleSaveTask} className="bg-red-500 text-white px-4 py-2 rounded">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Listar y Editar Categoria */}
        {isModalCategoriasOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-1/3">
              <h3 className="text-2xl mb-4 text-center">Editar Categorías</h3>
              <ul className="mb-4 max-h-80 overflow-y-auto pr-2">
                {categorias.map((categoria) => (
                  <li key={categoria.id} className="flex justify-between items-center mb-2">
                    <p>{categoria.descripcion}</p>
                    <button
                      onClick={() => handleCategoriaSeleccionada(categoria)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Editar
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-center">
                <button
                  onClick={() => setIsModalCategoriasOpen(false)}
                  className="bg-red-300 text-black px-4 py-2 rounded"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición de categoría */}
        {isEditCategoriaOpen && selectedCategoria && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-1/3">
              <h3 className="text-2xl mb-4 text-center">Editar Categoría</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium">ID</label>
                <input
                  type="text"
                  name="id"
                  value={selectedCategoria.id}
                  readOnly
                  className="border p-2 rounded w-full bg-red-200 cursor-not-allowed"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Descripción</label>
                <input
                  type="text"
                  name="descripcion"
                  value={categoriaInput}
                  onChange={handleCategoriaInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setIsEditCategoriaOpen(false)}
                  className="bg-red-300 text-black px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button onClick={handleSaveCategoria} className="bg-red-500 text-white px-4 py-2 rounded">
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de asignar usuario */}
        {isModalOpenAsignar && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-1/3">
              <h3 className="text-2xl mb-4 text-center">Asignar Usuario a la Tarea</h3>
              <div>
                <h4 className="text-lg font-medium mb-2">Selecciona una tarea:</h4>
                <ul className="mb-4">
                  {tasksSinAsignar.map((tarea) => (
                    <li key={tarea.id} className="flex justify-between items-center mb-2">
                      <p>{tarea.descripcion}</p>
                      <button
                        onClick={() => handleTareaSeleccionadaAsignar(tarea)}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Asignar
                      </button>
                    </li>
                  ))}
                </ul>
                {selectedTask && (
                  <div>
                    <h4 className="mb-2">Asignar Usuario a: {selectedTask.descripcion}</h4>
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
                )}
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setIsModalOpenAsignar(false)}
                  className="bg-red-300 text-black px-4 py-2 rounded mt-4"
                >
                  Cancelar
                </button>
                <button onClick={handleSaveAsignacion} className="bg-red-500 text-white px-4 py-2 rounded mt-4">
                  Guardar Asignación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtro de búsqueda por empleado */}
        <div className="flex justify-center gap-4 mb-4">
          <input
            type="text"
            name="empleado"
            placeholder="Nombre empleado"
            value={filters.empleado}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Tarjetas de tareas por estado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            ["Por Hacer", paginatedPorHacer, tasksPorHacer.length, pagePorHacer, setPagePorHacer, "bg-red-50"],
            ["En Proceso", paginatedEnProceso, tasksEnProceso.length, pageEnProceso, setPageEnProceso, "bg-yellow-50"],
            [
              "Finalizadas",
              paginatedFinalizadas,
              tasksFinalizadas.length,
              pageFinalizadas,
              setPageFinalizadas,
              "bg-green-50",
            ],
          ].map(([title, paginatedTasks, totalLength, currentPage, setPage, bgColor]) => (
            <div key={title}>
              <h2 className="text-2xl font-medium text-center mb-4">Tareas {title}</h2>
              {/* Paginación */}
              <div className="flex justify-center items-center mt-4 gap-2 flex-wrap">
                <button
                  onClick={() => handlePageChange(currentPage - 1, setPage, totalLength)}
                  disabled={currentPage <= 0}
                  className={`px-3 py-1 border rounded ${
                    currentPage <= 0 ? "bg-gray-300 cursor-not-allowed text-gray-600" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                >
                  Anterior
                </button>
                {Array.from({ length: Math.ceil(totalLength / itemsPerPage) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i, setPage, totalLength)}
                    className={`px-3 py-1 rounded border ${
                      i === currentPage ? "bg-gray-600 text-white" : "bg-white hover:bg-gray-400"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1, setPage, totalLength)}
                  disabled={currentPage >= Math.ceil(totalLength / itemsPerPage) - 1}
                  className={`px-3 py-1 border rounded ${
                    currentPage >= Math.ceil(totalLength / itemsPerPage) - 1
                      ? "bg-gray-300 cursor-not-allowed text-gray-600"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                >
                  Siguiente
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 mt-4">
                {paginatedTasks.map((tarea) => (
                  <div key={tarea.id} className={`border border-gray-300 rounded-lg shadow-lg p-5 ${bgColor}`}>
                    <div className="flex">
                      <h3 className="text-lg font-semibold text-gray-600">{tarea.descripcion}</h3>
                      <div className="ml-auto flex gap-2">
                        <button onClick={() => handleEdit(tarea)}>
                          <img className="w-6 h-6" src="editar.png" alt="Editar" />
                        </button>
                        <button onClick={() => handleDelete(tarea)}>
                          <img className="w-6 h-6" src="eliminar.png" alt="Eliminar" />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm ${getStatusColor(tarea.estado)}`}>
                      <strong>Estado:</strong> {tarea.estado}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Empleado Asignado:</strong>{" "}
                      {tarea.empleado_asignado && tarea.empleado_asignado !== "Sin asignar"
                        ? empleadosData.find((e) => String(e.id_usuario) === String(tarea.empleado_asignado))?.nombre ||
                          "Sin asignar"
                        : "Sin asignar"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Categoría:</strong>{" "}
                      {categorias.find((cat) => String(cat.id) === String(tarea.id_categoria))?.descripcion ||
                        "Sin asignar"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Fecha de Asignación:</strong> {tarea.fecha_asignacion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
