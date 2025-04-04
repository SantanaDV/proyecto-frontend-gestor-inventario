import React, { useState, useEffect } from 'react';
import useApi from '../utilities/apiComunicator';
import HeaderFuncional from '../components/HeaderFuncional';

export default function Tareas() {
  const { data, loading, error, setUri, setError } = useApi("/tarea", {});
  const [parsedData, setParsedData] = useState([]);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    descripcion: '',
    estado: 'Por hacer',
    empleado_asignado: '',
    fecha_asignacion: new Date().toISOString().split("T")[0], // Fecha actual
  });

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

  const filteredTasks = filter ? parsedData.filter((tarea) => tarea.estado === filter) : parsedData;

  const handleInputChange = (e) => {
    setNewTask({
      ...newTask,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/tarea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) throw new Error('Error al crear la tarea');

      const createdTask = await response.json();
      setParsedData([...parsedData, createdTask]); 
      setIsModalOpen(false);
      setNewTask({
        descripcion: '',
        estado: 'Por hacer',
        empleado_asignado: '',
        fecha_asignacion: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      setError('No se pudo añadir la tarea');
    }
  };

  return (
    <>
      <HeaderFuncional onAddClick={() => setIsModalOpen(true)} />

      <div className="flex justify-center gap-4 mt-6">
        <button onClick={() => setFilter('')} className={`px-4 py-2 rounded ${filter === '' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          Ver Todas
        </button>
        <button onClick={() => setFilter('Por hacer')} className={`px-4 py-2 rounded ${filter === 'Por hacer' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
          Tareas Por Hacer
        </button>
        <button onClick={() => setFilter('En Proceso')} className={`px-4 py-2 rounded ${filter === 'En Proceso' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}>
          En Proceso
        </button>
        <button onClick={() => setFilter('Finalizada')} className={`px-4 py-2 rounded ${filter === 'Finalizada' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
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
            <p className="text-sm text-gray-600"><strong>Empleado Asignado:</strong> {tarea.empleado_asignado}</p>
            <p className="text-sm text-gray-600"><strong>Fecha de Asignación:</strong> {tarea.fecha_asignacion}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4 text-red-700">Añadir Nueva Tarea</h2>
            <form onSubmit={handleSubmit}>
              Descripcion: <input type="text" name="descripcion" placeholder="Descripción" value={newTask.descripcion} onChange={handleInputChange} className="w-full border p-2 rounded mb-2" required />
              Estado: <select name="estado" value={newTask.estado} onChange={handleInputChange} className="w-full border p-2 rounded mb-2">
                <option value="Por hacer">Por hacer</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Finalizada">Finalizada</option>
              </select>
              Nombre: <input type="text" name="empleado_asignado" placeholder="Empleado asignado" value={newTask.empleado_asignado} onChange={handleInputChange} className="w-full border p-2 rounded mb-2" required />
              <button type="submit" className="bg-red-900 text-white px-4 py-2 rounded mr-2">Guardar</button>
              <button type="button" className="bg-red-300 px-4 py-2 rounded" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}