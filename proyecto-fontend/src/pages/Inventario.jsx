import React from 'react';
import Comunication from '../utilities/comunication';

export default function Inventario() {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Inventario de Productos</h2>

      <Comunication
        uri="/producto"
        opt={{ method: 'GET' }}
        render={({ data, loading, error }) => {
          if (loading) return <p style={styles.loading}>Cargando productos...</p>;
          if (error) return <p style={styles.error}>{error}</p>;
          if (!Array.isArray(data)) return <p style={styles.error}>Datos inválidos</p>;
          
          return (
            <div style={styles.grid}>
              {data.map((producto) => (
                <div key={producto.id_producto} style={styles.card}>
                  <img src={producto.url_img} alt={producto.nombre} style={styles.image} />
                  <h3 style={styles.productName}>{producto.nombre}</h3>
                  <p><strong>Cantidad:</strong> {producto.cantidad}</p>
                  <p><strong>Estado:</strong> {producto.estado}</p>
                  <p><strong>Categoría:</strong> {producto.categoria?.descripcion}</p>
                  <p><strong>QR:</strong> {producto.codigoQr}</p>
                </div>
              ))}
            </div>
          );
        }}
      />
    </div>
  );
}

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
  title: { textAlign: 'center', color: '#333' },
  loading: { textAlign: 'center', fontSize: '18px', color: '#007bff' },
  error: { textAlign: 'center', fontSize: '16px', color: 'red' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' },
  card: { border: '1px solid #ddd', borderRadius: '8px', padding: '15px', boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.1)', textAlign: 'center' },
  image: { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px' },
  productName: { fontSize: '18px', color: '#007bff' }
};
