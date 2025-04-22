import React, { useState, useEffect } from "react";
import useApi from "../utilities/apiComunicator";
import HeaderFuncional from "../components/HeaderFuncional";
import { useNavigate } from "react-router-dom";

export default function Tareas() {
  const { data, loading, error, setUri, setError } = useApi("api/tarea", {});
  const {
    data: categoriasData,
    loading: loadingCategorias,
    error: errorCategorias,
    setUri: setUriCategorias,
    setError: setErrorCategorias,
  } = useApi("api/categoria", {});

  const {
    data: empleadosData,
    loading: loadingEmpleados,
    error: errorEmpleados,
    setUri: setUriEmpleados,
    setError: setErrorEmpleados,
  } = useApi("api/empleado", {});

  const [categorias, setCategorias] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTask, setNewTask] = useState({
    id: "",
    descripcion: "",
    estado: "Por hacer",
    empleado_asignado: "",
    fecha_asignacion: new Date().toISOString().split("T")[0],
    id_categoria: "",
  });
  const [filters, setFilters] = useState({ empleado: "", fecha: "" });
  const [selectedTask, setSelectedTask] = useState(null);
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
  const [isModalOpenAsignar, setIsModalOpenAsignar] = useState(false);
  const navigate = useNavigate();

  const [pagePorHacer, setPagePorHacer] = useState(0);
  const [pageEnProceso, setPageEnProceso] = useState(0);
  const [pageFinalizadas, setPageFinalizadas] = useState(0);
  const itemsPerPage = 4;

  useEffect(() => {
    if (!localStorage.getItem("authToken")) navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (Array.isArray(categoriasData)) setCategorias(categoriasData);
    else if (categoriasData) setErrorCategorias("Los datos de categoría no son válidos");
  }, [categoriasData, setErrorCategorias]);

  useEffect(() => {
    if (Array.isArray(empleadosData)) setEmpleadosDisponibles(empleadosData);
    else if (empleadosData) setErrorEmpleados("Los datos de empleados no son válidos");
  }, [empleadosData, setErrorEmpleados]);

  useEffect(() => {
    if (!data) return;
    if (Array.isArray(data)) setParsedData(data);
    else setError("Los datos no son válidos");
  }, [data, setError]);

  const getStatusColor = (estado) => {
    switch (estado) {
      case "Por hacer": return "text-red-500";
      case "En Proceso": return "text-yellow-500";
      case "Finalizada": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const filteredTasks = parsedData.filter(tarea => (
    (filters.empleado === "" || tarea.empleado_asignado.toLowerCase().includes(filters.empleado.toLowerCase())) &&
    (filters.fecha === "" || tarea.fecha_asignacion === filters.fecha)
  ));

  const tasksPorHacer = filteredTasks.filter(t => t.estado === "Por hacer");
  const tasksEnProceso = filteredTasks.filter(t => t.estado === "En Proceso");
  const tasksFinalizadas = filteredTasks.filter(t => t.estado === "Finalizada");
  const tasksSinAsignar = parsedData.filter(t => !t.empleado_asignado || t.empleado_asignado === "Sin asignar");

  const paginatedPorHacer = tasksPorHacer.slice(pagePorHacer * itemsPerPage, (pagePorHacer + 1) * itemsPerPage);
  const paginatedEnProceso = tasksEnProceso.slice(pageEnProceso * itemsPerPage, (pageEnProceso + 1) * itemsPerPage);
  const paginatedFinalizadas = tasksFinalizadas.slice(pageFinalizadas * itemsPerPage, (pageFinalizadas + 1) * itemsPerPage);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setIsEditing(false);
  };

  const handleModalOpen = () => {
    const newId = parsedData.length ? Math.max(...parsedData.map(t => t.id)) + 1 : 1;
    setNewTask({
      id: newId,
      descripcion: "",
      estado: "Por hacer",
      empleado_asignado: "",
      fecha_asignacion: new Date().toISOString().split("T")[0],
      id_categoria: "",
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (tarea) => {
    setNewTask({
      ...tarea,
      fecha_asignacion: tarea.fecha_asignacion.split('T')[0],
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveTask = () => {
    console.log(isEditing ? "Actualizando tarea:" : "Guardando nueva tarea:", newTask);
    setIsModalOpen(false);
    setIsEditing(false);
  };

  const handleModalOpenAsignar = () => setIsModalOpenAsignar(true);

  const handleTareaSeleccionada = (tarea) => setSelectedTask(tarea);

  const handleEmpleadoChange = (e) => {
    setSelectedTask({ ...selectedTask, empleado_asignado: e.target.value });
  };

  const handleSaveAsignacion = () => {
    console.log("Empleado asignado:", selectedTask);
    setIsModalOpenAsignar(false);
    setSelectedTask(null);
  };

  const handlePageChange = (page, setPage, totalLength) => {
    if (page >= 0 && page < Math.ceil(totalLength / itemsPerPage)) {
      setPage(page);
    }
  };

  const handleDelete = (id_producto) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este producto?");
    if (confirmDelete) {
      // Aquí eliminamos
    }
  };
  return (
    <>
      <HeaderFuncional
        botones={["Añadir", "Asignar Usuario", "Calendario"]}
        acciones={{
          Añadir: handleModalOpen,
          "Asignar Usuario": handleModalOpenAsignar,
          Calendario: () => navigate("/calendario"),
        }}
      />

      <div className="p-6">
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
                <label className="block text-sm font-medium">
                  Empleado Asignado
                </label>
                <input
                  type="text"
                  name="empleado_asignado"
                  value={newTask.empleado_asignado}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
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
                <label className="block text-sm font-medium">
                  Fecha de Asignación
                </label>
                <input
                  type="date"
                  name="fecha_asignacion"
                  value={newTask.fecha_asignacion}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Categoría</label>
                <select
                  name="id_categoria"
                  value={newTask.id_categoria}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.descripcion}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={handleModalClose}
                  className="bg-red-300 text-black px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveTask}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {isModalOpenAsignar && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-1/3">
              <h3 className="text-2xl mb-4 text-center">
                Asignar Usuario a la Tarea
              </h3>
              <div>
                <h4 className="text-lg font-medium mb-2">
                  Selecciona una tarea:
                </h4>
                <ul className="mb-4">
                  {tasksSinAsignar.map((tarea) => (
                    <li
                      key={tarea.id}
                      className="flex justify-between items-center mb-2"
                    >
                      <p>{tarea.descripcion}</p>
                      <button
                        onClick={() => handleTareaSeleccionada(tarea)}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Asignar
                      </button>
                    </li>
                  ))}
                </ul>

                {selectedTask && (
                  <div>
                    <h4 className="mb-2">
                      Asignar Usuario a: {selectedTask.descripcion}
                    </h4>
                    <select
                      value={selectedTask.empleado_asignado}
                      onChange={handleEmpleadoChange}
                      className="border p-2 rounded w-full"
                    >
                      <option value="">Seleccionar Empleado</option>
                      {empleadosDisponibles.map((e) => (
                        <option key={e.id} value={e.empleado_asignado}>
                          {e.empleado_asignado}
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
                <button
                  onClick={handleSaveAsignacion}
                  className="bg-red-500 text-white px-4 py-2 rounded mt-4"
                >
                  Guardar Asignación
                </button>
              </div>
            </div>
          </div>
        )}

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            [
              "Por Hacer",
              paginatedPorHacer,
              tasksPorHacer.length,
              pagePorHacer,
              setPagePorHacer,
              "bg-red-50",
            ],
            [
              "En Proceso",
              paginatedEnProceso,
              tasksEnProceso.length,
              pageEnProceso,
              setPageEnProceso,
              "bg-yellow-50",
            ],
            [
              "Finalizadas",
              paginatedFinalizadas,
              tasksFinalizadas.length,
              pageFinalizadas,
              setPageFinalizadas,
              "bg-green-50",
            ],
          ].map(
            ([
              title,
              paginatedTasks,
              totalLength,
              currentPage,
              setPage,
              bgColor,
            ]) => (
              <div key={title}>
                <h2 className="text-2xl font-medium text-center mb-4">
                  Tareas {title}
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {paginatedTasks.map((tarea) => (
                    <div
                      key={tarea.id}
                      className={`border border-gray-300 rounded-lg shadow-lg p-5 ${bgColor}`}
                    >
                      <div className="flex">
                        <h3 className="text-lg font-semibold text-blue-600">
                          {tarea.descripcion}
                        </h3>
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
                        {tarea.empleado_asignado}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Categoría:</strong> {tarea.id_categoria}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Fecha de Asignación:</strong>{" "}
                        {tarea.fecha_asignacion}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1, setPage, totalLength)}
                    disabled={currentPage <= 0}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1, setPage, totalLength)}
                    disabled={currentPage >= Math.ceil(totalLength / itemsPerPage) - 1}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
