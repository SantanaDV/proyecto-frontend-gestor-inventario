import React, { useState, useEffect } from 'react';
import useApi from '../utilities/apiComunicator';
import HeaderFuncional from '../components/HeaderFuncional'

const cargarDatos = (data, setParsedData, setError) => {
  if (!data) return;
  if (Array.isArray(data)) {
    setParsedData(data);
  } else {
    setError('Los datos no son válidos');
    setParsedData(null);
  }
};

export default function Inventario() {
  const { data, loading, error, setUri, setError } = useApi("/producto", {});
  const [parsedData, setParsedData] = useState([]);

  useEffect(() => {
    cargarDatos(data, setParsedData, setError);
  }, [data, setParsedData, setError]);

  return (
    <>
      <HeaderFuncional />
      <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] gap-5 mt-5 p-8">
        {loading && <p>Cargando...</p>}
        {error && <p>Error: {error}</p>}

        {parsedData.map((producto) => (
          <div key={producto.id_producto} className="border border-gray-300 rounded-lg shadow-md text-center">
            <img src={producto.url_img} alt={producto.nombre} className="w-full h-36 object-cover rounded-md" />
            <h3 className="text-lg text-blue-500">{producto.nombre}</h3>
            <p><strong>Cantidad:</strong> {producto.cantidad}</p>
            <p><strong>Estado:</strong> {producto.estado}</p>
            <p><strong>Categoría:</strong> {producto.categoria?.descripcion || "Sin categoría"}</p>
            <p><strong>QR:</strong> {producto.codigoQr}</p>
          </div>
        ))}
      </div>

    </>
  );

}