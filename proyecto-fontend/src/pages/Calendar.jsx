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
    console.log("Añadir tarea para:", date.toLocaleDateString("en-CA"));
  };

  const handleEditTask = (tarea) => {
    console.log("Editar tarea:", tarea);
  };

  return (
    <>
      <HeaderFuncional />
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Calendario de Tareas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
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

          <div>
            <h3 className="text-xl font-semibold mb-2">
              Tareas para el {selectedDate.toLocaleDateString("en-CA")}
            </h3>
            <button
              onClick={() => handleAddTask(selectedDate)}
              className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Añadir Tarea
            </button>
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
                    <button onClick={() => handleEditTask(tarea)}>
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
      </div>
    </>
  );
}
