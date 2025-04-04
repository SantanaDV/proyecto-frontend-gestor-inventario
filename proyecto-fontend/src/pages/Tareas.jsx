import React, { useState, useEffect } from 'react';
import useApi from '../utilities/apiComunicator';
import HeaderFuncional from '../components/HeaderFuncional';

export default function Tareas() {
  const { data, loading, error, setUri, setError } = useApi("/tarea", {});
  const [parsedData, setParsedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    descripcion: '',
    estado: 'Por hacer',
    empleado_asignado: '',
    fecha_asignacion: new Date().toISOString().split("T")[0],
  });
  const [filters, setFilters] = useState({ empleado: '', fecha: '' });

  useEffect(() => {
    if (!data) return;
    if (Array.isArray(data)) {
      setParsedData(data);
    } else {
      setError('Los datos no son válidos');
    }
  }, [data, setError]);

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Por hacer': return 'text-red-500';
      case 'En Proceso': return 'text-yellow-500';
      case 'Finalizada': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const filteredTasks = parsedData.filter(tarea => {
    return (
      (filters.empleado === '' || tarea.empleado_asignado.toLowerCase().includes(filters.empleado.toLowerCase())) &&
      (filters.fecha === '' || tarea.fecha_asignacion === filters.fecha)
    );
  });

  const tasksPorHacer = filteredTasks.filter(tarea => tarea.estado === 'Por hacer');
  const tasksEnProceso = filteredTasks.filter(tarea => tarea.estado === 'En Proceso');
  const tasksFinalizadas = filteredTasks.filter(tarea => tarea.estado === 'Finalizada');

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <>
      <HeaderFuncional onAddClick={() => setIsModalOpen(true)} />
      <div className="p-6">
        <div className="flex justify-center gap-4 mb-4">
          <input type="text" name="empleado" placeholder="Nombre empleado" value={filters.empleado} onChange={handleFilterChange} className="border p-2 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[['Por Hacer', tasksPorHacer, 'bg-red-50'], ['En Proceso', tasksEnProceso, 'bg-yellow-50'], ['Finalizadas', tasksFinalizadas, 'bg-green-50']].map(([title, tasks, bgColor]) => (
            <div key={title}>
              <h2 className="text-2xl font-medium text-center mb-4">Tareas {title}</h2>
              <div className="grid grid-cols-1 gap-6">
                {tasks.map(tarea => (
                  <div key={tarea.id} className={`border border-gray-300 rounded-lg shadow-lg p-5 ${bgColor}`}>
                    <h3 className="text-lg font-semibold text-blue-600 mb-2">{tarea.descripcion}</h3>
                    <p className={`text-sm ${getStatusColor(tarea.estado)}`}>
                      <strong>Estado:</strong> {tarea.estado}
                    </p>
                    <p className="text-sm text-gray-600"><strong>Empleado Asignado:</strong> {tarea.empleado_asignado}</p>
                    <p className="text-sm text-gray-600"><strong>Fecha de Asignación:</strong> {tarea.fecha_asignacion}</p>
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
