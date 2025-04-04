import React, { useState, useEffect } from 'react';
import useApi from '../utilities/apiComunicator';
import HeaderFuncional from '../components/HeaderFuncional';

const cargarDatos = (data, setParsedData, setError) => {
  if (!data) return;
  if (Array.isArray(data)) {
    const productosOrdenados = data.sort((a, b) => a.nombre?.localeCompare(b.nombre) || 0);
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    cantidad: '',
    estado: 'activo',
    categoria: '',
    fecha_creacion: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    cargarDatos(data, setParsedData, setError);
  }, [data, setParsedData, setError]);

  // Filtrar productos por estado
  const filteredProducts = filter ? parsedData.filter((producto) => producto.estado === filter) : parsedData;

  const handleInputChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/producto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) throw new Error('Error al crear el producto');

      const createdProduct = await response.json();
      setParsedData([...parsedData, createdProduct]);
      setIsModalOpen(false);
      setNewProduct({
        nombre: '',
        cantidad: '',
        estado: 'activo',
        categoria: '',
        fecha_creacion: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      setError('No se pudo añadir el producto');
    }
  };

  return (
    <>
      <HeaderFuncional onAddClick={() => setIsModalOpen(true)} />

      <div className="flex justify-center gap-4 mt-6">
        <button onClick={() => setFilter('')} className={`px-4 py-2 rounded ${filter === '' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          Ver Todos
        </button>
        <button onClick={() => setFilter('activo')} className={`px-4 py-2 rounded ${filter === 'activo' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
          Activo
        </button>
        <button onClick={() => setFilter('desactivado')} className={`px-4 py-2 rounded ${filter === 'desactivado' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
          Desactivado
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] gap-5 mt-5 p-8">
        {loading && <p className="col-span-full text-center">Cargando...</p>}
        {error && <p className="col-span-full text-center text-red-500">Error: {error}</p>}

        {filteredProducts.map((producto) => (
          <div key={producto.id_producto} className="border border-gray-300 rounded-lg shadow-md text-center bg-white p-4">
            <img src={producto.url_img} alt={producto.nombre} className="w-full h-36 object-cover rounded-md mb-4" />
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4 text-red-700">Añadir Nuevo Producto</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" name="nombre" placeholder="Nombre del producto" value={newProduct.nombre} onChange={handleInputChange} className="w-full border p-2 rounded mb-2" required />
              <input type="number" name="cantidad" placeholder="Cantidad" value={newProduct.cantidad} onChange={handleInputChange} className="w-full border p-2 rounded mb-2" required />
              <select name="estado" value={newProduct.estado} onChange={handleInputChange} className="w-full border p-2 rounded mb-2">
                <option value="activo">Activo</option>
                <option value="desactivado">Desactivado</option>
              </select>
              <input type="text" name="categoria" placeholder="Categoría" value={newProduct.categoria} onChange={handleInputChange} className="w-full border p-2 rounded mb-2" />
              <button type="submit" className="bg-red-900 text-white px-4 py-2 rounded mr-2">Guardar</button>
              <button type="button" className="bg-red-300 px-4 py-2 rounded" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
