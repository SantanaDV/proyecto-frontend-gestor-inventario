import React, { useState, useEffect } from 'react';
import useApi from '../utilities/apiComunicator';
import HeaderFuncional from '../components/HeaderFuncional';

const cargarDatos = (data, setParsedData, setCategorias, setError) => {
  if (!data) return;
  if (Array.isArray(data)) {
    const productosOrdenados = data.sort((a, b) => a.nombre?.localeCompare(b.nombre) || 0);
    setParsedData(productosOrdenados);
    const categoriasUnicas = [...new Set(productosOrdenados.map(p => p.categoria?.descripcion || "Sin categoría"))];
    setCategorias(categoriasUnicas);
  } else {
    setError('Los datos no son válidos');
    setParsedData([]);
  }
};

export default function Inventario() {
  const { data, loading, error, setUri, setError } = useApi("/producto", {});
  const [parsedData, setParsedData] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [cantidadFiltro, setCantidadFiltro] = useState('');

  useEffect(() => {
    cargarDatos(data, setParsedData, setCategorias, setError);
  }, [data]);

  const productosFiltrados = parsedData.filter(producto => {
    const categoriaValida = producto.categoria?.descripcion || "Sin categoría";
    const cantidadValida = Number(producto.cantidad) || 0;
    return (
      (categoriaFiltro === '' || categoriaValida === categoriaFiltro) &&
      (cantidadFiltro === '' || cantidadValida <= Number(cantidadFiltro))
    );
  });

  const productosActivos = productosFiltrados.filter(p => p.estado === 'activo');
  const productosDesactivados = productosFiltrados.filter(p => p.estado === 'desactivado');

  return (
    <>
      <HeaderFuncional />

      <div className="flex justify-center gap-4 mt-6">
        <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)} className="border p-2 rounded">
          <option value="">Todas las categorías</option>
          {categorias.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>

        <input type="number" placeholder="Cantidad máxima" value={cantidadFiltro} onChange={(e) => setCantidadFiltro(e.target.value)} className="border p-2 rounded" />
      </div>

      <div className="grid grid-cols-2 gap-5 mt-5 p-8">
        <div>
          <h2 className="text-lg font-bold text-green-600 mb-4 text-center">Productos Activos</h2>
          {productosActivos.length === 0 ? <p>No hay productos activos.</p> : productosActivos.map(producto => (
            <div key={producto.id_producto} className="border border-gray-300 rounded-lg shadow-md text-center bg-green-50 p-4 mb-4 flex flex-col items-center">
              <h3 className="text-lg text-blue-500 font-semibold">{producto.nombre}</h3>
              <img src={producto.url_img} alt={producto.nombre} className="w-24 h-24 object-cover rounded-md mb-4 mx-auto" />
              <p><strong>Cantidad:</strong> {producto.cantidad}</p>
              <p><strong>Categoría:</strong> {producto.categoria?.descripcion || "Sin categoría"}</p>
              <p><strong>QR:</strong> {producto.codigoQr}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-bold text-red-600 mb-4 text-center">Productos Desactivados</h2>
          {productosDesactivados.length === 0 ? <p>No hay productos desactivados.</p> : productosDesactivados.map(producto => (
            <div key={producto.id_producto} className="border border-gray-300 rounded-lg shadow-md text-center bg-red-50 p-4 mb-4 flex flex-col items-center">
              <h3 className="text-lg text-blue-500 font-semibold">{producto.nombre}</h3>
              <img src={producto.url_img} alt={producto.nombre} className="w-24 h-24 object-cover rounded-md mb-4 mx-auto" />
              <p><strong>Cantidad:</strong> {producto.cantidad}</p>
              <p><strong>Categoría:</strong> {producto.categoria?.descripcion || "Sin categoría"}</p>
              <p><strong>QR:</strong> {producto.codigoQr}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
