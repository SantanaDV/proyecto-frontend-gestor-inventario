import React, { useState, useEffect } from 'react';
import useApi from '../utilities/apiComunicator';
import HeaderFuncional from '../components/HeaderFuncional';

export default function Tareas() {
  const { data, loading, error, setUri, setError } = useApi("/tarea", {});
  const [parsedData, setParsedData] = useState([]);
  const [filter, setFilter] = useState(''); 

  useEffect(() => {
    if (!data) return;
    if (Array.isArray(data)) {
      setParsedData(data);
    } else {
      setError('Los datos no son válidos');
    }
  }, [data, setError]);

  // Función para obtener el color según el estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Por hacer':
        return 'text-red-500';
      case 'En Proceso':
        return 'text-yellow-500';
      case 'Finalizada':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  // Filtrar tareas según el estado seleccionado
  const filteredTasks = filter ? parsedData.filter((tarea) => tarea.estado === filter) : parsedData;

  return (
    <>
      <HeaderFuncional />
      
      <div className="flex justify-center gap-4 mt-6">
      <button 
          onClick={() => setFilter('')} 
          className={`px-4 py-2 rounded ${filter === '' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          Ver Todas
        </button>
        <button 
          onClick={() => setFilter('Por hacer')} 
          className={`px-4 py-2 rounded ${filter === 'Por hacer' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
          Tareas Por Hacer
        </button>
        <button 
          onClick={() => setFilter('En Proceso')} 
          className={`px-4 py-2 rounded ${filter === 'En Proceso' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}>
          En Proceso
        </button>
        <button 
          onClick={() => setFilter('Finalizada')} 
          className={`px-4 py-2 rounded ${filter === 'Finalizada' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
          Finalizadas
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 p-8">
        {loading && <p className="col-span-full text-center text-gray-500">Cargando...</p>}
        {error && <p className="col-span-full text-center text-red-500">Error: {error}</p>}

        {filteredTasks.map((tarea) => (
          <div key={tarea.id} className="border border-gray-300 rounded-lg shadow-lg p-5 bg-white">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">{tarea.descripcion}</h3>
            <p className={`text-sm ${getStatusColor(tarea.estado)}`}>
              <strong>Estado:</strong> {tarea.estado}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Empleado Asignado:</strong> {tarea.empleado_asignado}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Fecha de Asignación:</strong> {new Date(tarea.fecha_asignacion).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Fecha de Finalización:</strong> {new Date(tarea.fecha_finalizacion).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
