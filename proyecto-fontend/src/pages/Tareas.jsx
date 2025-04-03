import React, { useState, useEffect } from 'react';
import useApi from '../utilities/apiComunicator';
import HeaderFuncional from '../components/HeaderFuncional';

export default function Tareas() {
  const { data, loading, error, setUri, setError } = useApi("/tarea", {});
  const [parsedData, setParsedData] = useState([]);

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
        return 'text-red-500'; // Azul
      case 'En Proceso':
        return 'text-yellow-500'; // Amarillo
      case 'Finalizada':
        return 'text-green-500'; // Verde
      default:
        return 'text-gray-500'; // Gris por defecto
    }
  };

  return (
    <>
      <HeaderFuncional />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 p-8">
        {loading && <p className="col-span-full text-center text-gray-500">Cargando...</p>}
        {error && <p className="col-span-full text-center text-red-500">Error: {error}</p>}

        {parsedData.map((tarea) => (
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
