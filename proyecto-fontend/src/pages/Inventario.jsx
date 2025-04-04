import React, { useState, useEffect } from 'react';
import useApi from '../utilities/apiComunicator';
import HeaderFuncional from '../components/HeaderFuncional';

const cargarDatos = (data, setParsedData, setError) => {
  if (!data) return;
  if (Array.isArray(data)) {
    // Ordenar productos por nombre alfabéticamente
    const productosOrdenados = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
    setParsedData(productosOrdenados);
  } else {
    setError('Los datos no son válidos');
    setParsedData(null);
  }
};

const getStatusColor = (estado) => {
  switch (estado) {
    case 'activo':
      return 'bg-green-100 text-green-600';  
    case 'desactivado':
      return 'bg-red-100 text-red-600'; 
    default:
      return 'bg-gray-100 text-gray-600'; 
  }
};

export default function Inventario() {
  const { data, loading, error, setUri, setError } = useApi("/producto", {});
  const [parsedData, setParsedData] = useState([]);
  const [filter, setFilter] = useState(''); 

  useEffect(() => {
    cargarDatos(data, setParsedData, setError);
  }, [data, setParsedData, setError]);

  // Filtrar productos según el estado seleccionado
  const filteredProducts = filter ? parsedData.filter((tarea) => tarea.estado === filter) : parsedData;

  return (
    <>
      <HeaderFuncional />

      <div className="flex justify-center gap-4 mt-6">
        <button 
          onClick={() => setFilter('')} 
          className={`px-4 py-2 rounded ${filter === '' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          Ver Todos
        </button>
        <button 
          onClick={() => setFilter('activo')} 
          className={`px-4 py-2 rounded ${filter === 'activo' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
          Activo
        </button>
        <button 
          onClick={() => setFilter('desactivado')} 
          className={`px-4 py-2 rounded ${filter === 'desactivado' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
          Desactivado
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] gap-5 mt-5 p-8">
        {loading && <p className="col-span-full text-center">Cargando...</p>}
        {error && <p className="col-span-full text-center text-red-500">Error: {error}</p>}

        {filteredProducts.map((producto) => (
          <div key={producto.id_producto} className="border border-gray-300 rounded-lg shadow-md text-center bg-white p-4">
            <img
              src={producto.url_img}
              alt={producto.nombre}
              className="w-full h-36 object-cover rounded-md mb-4"
            />
            <h3 className="text-lg text-blue-500 font-semibold">{producto.nombre}</h3>
            <p><strong>Cantidad:</strong> {producto.cantidad}</p>
            <p>
              <strong>Estado:</strong>
              <span className={`px-2 py-1 rounded-full ${getStatusColor(producto.estado)}`}>
                {producto.estado}
              </span>
            </p>
            <p><strong>Categoría:</strong> {producto.categoria?.descripcion || "Sin categoría"}</p>
            <p><strong>QR:</strong> {producto.codigoQr}</p>
          </div>
        ))}
      </div>
    </>
  );
}
