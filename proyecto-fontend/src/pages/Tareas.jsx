import React, { useState, useEffect } from "react";
import useApi from "../utilities/apiComunicator";
import HeaderFuncional from "../components/HeaderFuncional";
import { useNavigate } from "react-router-dom";

export default function Tareas() {
  const { data, loading, error, setUri, setError } = useApi("/tarea", {});
  const [parsedData, setParsedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  useEffect(() => {
    if (!localStorage.getItem("authToken")) {
      navigate('/');
    }
  }, [navigate]);


  useEffect(() => {
    if (!data) return;
    if (Array.isArray(data)) {
      setParsedData(data);
    } else {
      setError("Los datos no son válidos");
    }
  }, [data, setError]);

  const getStatusColor = (estado) => {
    switch (estado) {
      case "Por hacer":
        return "text-red-500";
      case "En Proceso":
        return "text-yellow-500";
      case "Finalizada":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const filteredTasks = parsedData.filter((tarea) => {
    return (
      (filters.empleado === "" ||
        tarea.empleado_asignado
          .toLowerCase()
          .includes(filters.empleado.toLowerCase())) &&
      (filters.fecha === "" || tarea.fecha_asignacion === filters.fecha)
    );
  });

  const tasksPorHacer = filteredTasks.filter(
    (tarea) => tarea.estado === "Por hacer"
  );
  const tasksEnProceso = filteredTasks.filter(
    (tarea) => tarea.estado === "En Proceso"
  );
  const tasksFinalizadas = filteredTasks.filter(
    (tarea) => tarea.estado === "Finalizada"
  );
  const tasksSinAsignar = parsedData.filter(
    (tarea) =>
      tarea.empleado_asignado === "" ||
      tarea.empleado_asignado === "Sin asignar"
  );

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleModalOpen = () => {
    const newId = parsedData.length
      ? Math.max(...parsedData.map((t) => t.id)) + 1
      : 1;
    setNewTask({
      id: newId,
      descripcion: "",
      estado: "Por hacer",
      empleado_asignado: "",
      fecha_asignacion: new Date().toISOString().split("T")[0],
      id_categoria: "",
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSaveTask = () => {
    console.log("Guardando nueva tarea:", newTask);
    setIsModalOpen(false);
  };

  const handleModalOpenAsignar = () => {
    setIsModalOpenAsignar(true);
  };

  const handleTareaSeleccionada = (tarea) => {
    setSelectedTask(tarea); // Guardamos la tarea seleccionada para editar
  };

  const handleEmpleadoChange = (e) => {
    setSelectedTask({
      ...selectedTask,
      empleado_asignado: e.target.value,
    });
  };

  const handleSaveAsignacion = () => {
    console.log("Empleado asignado:", selectedTask);
    setIsModalOpenAsignar(false); // Cerrar el modal después de guardar
    setSelectedTask(null); // Limpiar la tarea seleccionada
  };

  return (
    <>
      <HeaderFuncional
        botones={["Añadir", "Asignar Usuario", "Calendario"]}
        acciones={{
          Añadir: handleModalOpen,
          "Asignar Usuario": handleModalOpenAsignar,
          "Calendario": () => navigate("/calendario")
        }}
      />

      <div className="p-6">
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-1/3">
              <h3 className="text-2xl mb-4 text-center">Añadir Tarea</h3>
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
                <label className="block text-sm font-medium">
                  ID Categoría
                </label>
                <input
                  type="text"
                  name="id_categoria"
                  value={newTask.id_categoria}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
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
            ["Por Hacer", tasksPorHacer, "bg-red-50"],
            ["En Proceso", tasksEnProceso, "bg-yellow-50"],
            ["Finalizadas", tasksFinalizadas, "bg-green-50"],
          ].map(([title, tasks, bgColor]) => (
            <div key={title}>
              <h2 className="text-2xl font-medium text-center mb-4">
                Tareas {title}
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {tasks.map((tarea) => (
                  <div
                    key={tarea.id}
                    className={`border border-gray-300 rounded-lg shadow-lg p-5 ${bgColor}`}
                  >
                    <div className="flex">
                      <h3 className="text-lg font-semibold text-blue-600">
                        {tarea.descripcion}
                      </h3>
                      <div className="ml-auto flex gap-2">
                        <button>
                          <img className="w-6 h-6" src="editar.png" />
                        </button>
                        <button>
                          <img className="w-6 h-6" src="eliminar.png" />
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
                      <strong>Fecha de Asignación:</strong>{" "}
                      {tarea.fecha_asignacion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
