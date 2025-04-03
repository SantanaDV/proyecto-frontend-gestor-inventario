import React, { useState, useEffect } from 'react';
import useApi from '../utilities/apiComunicator';

export default function Inventario() {
  const { data, loading, error,setUri,setError } = useApi("/producto", {}); 
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

      {parsedData.map((producto) => (
        <div key={producto.id_producto} style={styles.card}>
          <img src={producto.url_img} alt={producto.nombre} style={styles.image} />
          <h3 style={styles.productName}>{producto.nombre}</h3>
          <p><strong>Cantidad:</strong> {producto.cantidad}</p>
          <p><strong>Estado:</strong> {producto.estado}</p>
          <p><strong>Categoría:</strong> {producto.categoria?.descripcion || "Sin categoría"}</p>
          <p><strong>QR:</strong> {producto.codigoQr}</p>
        </div>
      ))}
    </div>
  );
}
