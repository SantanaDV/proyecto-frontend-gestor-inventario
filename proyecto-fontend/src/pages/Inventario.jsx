import React, { useState, useEffect } from 'react';
import useApi from '../utilities/apiComunicator';

export default function Inventario() {
  const { data, loading, error } = useApi("/producto", {}); 
  const [parsedData, setParsedData] = useState([]);

  useEffect(() => {
    if (!data) return;
    if (Array.isArray(data)) {
      setParsedData(data);
    } else {
      setError('Los datos no son válidos');
    }
  }, [data]); 

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
  image: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '5px',
  },
  productName: {
    fontSize: '18px',
    color: '#007bff',
  },
};
