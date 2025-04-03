import React, { useState, useEffect } from 'react';
import useApi from '../utilities/apiComunicator';

export default function Tareas() {
const { data, loading, error,setUri,setError } = useApi("/tarea", {}); 
  const [parsedData, setParsedData] = useState([]);

  useEffect(() => {
    if (!data) return;
    if (Array.isArray(data)) {
      setParsedData(data);
    } else {
      setError('Los datos no son válidos');
    }
  }, [data, setError]); 

  return (
    <div style={styles.grid}>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {parsedData.map((tarea) => (
        <div key={tarea.id} style={styles.card}>
          <h3 style={styles.taskName}>{tarea.descripcion}</h3>
          <p><strong>Estado:</strong> {tarea.estado}</p>
          <p><strong>Empleado Asignado:</strong> {tarea.empleado_asignado}</p>
          <p><strong>Fecha de Asignación:</strong> {new Date(tarea.fecha_asignacion).toLocaleString()}</p>
          <p><strong>Fecha de Finalización:</strong> {new Date(tarea.fecha_finalizacion).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  taskName: {
    fontSize: '18px',
    color: '#007bff',
  },
};

