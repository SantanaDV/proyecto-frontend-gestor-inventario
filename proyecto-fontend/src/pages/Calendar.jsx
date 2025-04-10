import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import useApi from "../utilities/apiComunicator";
import HeaderFuncional from "../components/HeaderFuncional";

export default function CalendarioTareas() {
  const navigate = useNavigate();
  const { data, loading, error, setUri, setError } = useApi("/tarea", {});
  const [parsedData, setParsedData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    id: "",
    descripcion: "",
    estado: "Por hacer",
    empleado_asignado: "",
    fecha_asignacion: new Date().toISOString().split("T")[0],
    id_categoria: "",
  });

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

  const tareasPorFecha = (fecha) => {
    const fechaStr = fecha.toLocaleDateString("en-CA");
    return parsedData.filter(t => t.fecha_asignacion === fechaStr);
  };

  const handleAddTask = (date) => {
    const today = new Date();
    // Asegúrate de comparar solo las fechas (sin tener en cuenta la hora)
    const selectedDateWithoutTime = new Date(date);
    selectedDateWithoutTime.setHours(0, 0, 0, 0);
    const todayWithoutTime = new Date(today);
    todayWithoutTime.setHours(0, 0, 0, 0);

    if (selectedDateWithoutTime < todayWithoutTime) {
      alert("No puedes añadir tareas en días anteriores a la fecha actual.");
      return;
    }

    const newId = parsedData.length
      ? Math.max(...parsedData.map((t) => t.id)) + 1
      : 1;
    setNewTask({
      id: newId,
      descripcion: "",
      estado: "Por hacer",
      empleado_asignado: "",
      // Aquí ajustamos la fecha para que no se pierda el día debido a la zona horaria
      fecha_asignacion: date.toISOString().split("T")[0],  // Usamos la fecha en formato 'YYYY-MM-DD'
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
    setIsModalOpen(false); // Cerrar modal después de guardar
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Formatea la fecha para evitar problemas de zona horaria al mostrarla
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <HeaderFuncional />
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Calendario de Tareas</h2>
        <div className="flex justify-center items-center mb-4">
          <div className="flex justify-center items-center mb-4">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={({ date }) => {
                const tareas = tareasPorFecha(date);
                return (
                  <div>
                    {tareas.length > 0 && (
                      <div className="text-xs text-blue-600 font-semibold">
                        {tareas.length} tarea(s)
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => handleAddTask(selectedDate)}
            className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Añadir Tarea
          </button>
        </div>

        <div className="flex justify-center items-center mb-4">
          <h3 className="text-xl font-semibold mb-2">
            Tareas para el {selectedDate.toLocaleDateString("en-CA")}
          </h3>
          <div className="space-y-4">
            {tareasPorFecha(selectedDate).map((tarea) => (
              <div
                key={tarea.id}
                className="border border-gray-300 rounded p-3 shadow"
              >
                <div className="flex justify-between">
                  <h4 className="font-semibold text-lg">
                    {tarea.descripcion}
                  </h4>
                  <button onClick={() => console.log("Editar tarea:", tarea)}>
                    <img src="editar.png" alt="Editar" className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Estado: {tarea.estado} <br />
                  Asignado a: {tarea.empleado_asignado || "Sin asignar"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

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
              <label className="block text-sm font-medium">Empleado Asignado</label>
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
              <label className="block text-sm font-medium">Fecha de Asignación</label>
              <input
                type="date"
                name="fecha_asignacion"
                value={selectedDate.toLocaleDateString("en-CA")} 
                readOnly
                className="border p-2 rounded w-full bg-red-200 cursor-not-allowed"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">ID Categoría</label>
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
    </>
  );
}
