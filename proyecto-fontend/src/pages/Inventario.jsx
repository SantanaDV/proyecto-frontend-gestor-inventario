import React, { useState, useEffect } from "react";
import useApi from "../utilities/apiComunicator";
import HeaderFuncional from "../components/HeaderFuncional";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export default function Inventario() {
  const navigate = useNavigate();
  const { data, loading, error, setUri, setError, setOptions } = useApi(
    "api/producto",
    {}
  );
  const {
    data: dataCategoria,
    loading: loadingCategoria,
    error: errorCategoria,
    setUri: uriCategoria,
    setError: setErrorCate,
    setOptions: setOptionsCate,
  } = useApi("api/categoria", {});
  const [parsedData, setParsedData] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [cantidadFiltro, setCantidadFiltro] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  const [newProduct, setNewProduct] = useState({
    id_producto: "",
    nombre: "",
    cantidad: 0,
    categoria: "",
    codigoQr: "",
    estado: "activo",
    url_img: null,
    fecha_creacion: new Date().toISOString().split("T")[0],
  });

  const [paginaActiva, setPaginaActiva] = useState(1);
  const [paginaDesactivada, setPaginaDesactivada] = useState(1);
  const productosPorPagina = 3;

  useEffect(() => {
    if (!localStorage.getItem("authToken")) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!data) return;

    if (Array.isArray(data)) {
      const productosOrdenados = data.sort(
        (a, b) => a.nombre?.localeCompare(b.nombre) || 0
      );
      setParsedData(productosOrdenados);
    } else {
      setError("Los datos no son válidos");
      setParsedData([]);
    }
  }, [data, setError]);

  // Cargar todas las categorías directamente desde el endpoint
  useEffect(() => {
    if (Array.isArray(dataCategoria)) {
      setCategorias(dataCategoria);
    }
  }, [dataCategoria]);

  const productosFiltrados = parsedData.filter((producto) => {
    const categoriaValida = producto.categoria?.descripcion || "Sin categoría";
    const cantidadValida = Number(producto.cantidad) || 0;
    return (
      (categoriaFiltro === "" || categoriaValida === categoriaFiltro) &&
      (cantidadFiltro === "" || cantidadValida <= Number(cantidadFiltro))
    );
  });

  const productosActivos = productosFiltrados.filter(
    (p) => p.estado === "activo"
  );
  const productosDesactivados = productosFiltrados.filter(
    (p) => p.estado === "desactivado"
  );

  const indiceInicioActivos = (paginaActiva - 1) * productosPorPagina;
  const productosActivosPaginados = productosActivos.slice(
    indiceInicioActivos,
    indiceInicioActivos + productosPorPagina
  );

  const indiceInicioDesactivados = (paginaDesactivada - 1) * productosPorPagina;
  const productosDesactivadosPaginados = productosDesactivados.slice(
    indiceInicioDesactivados,
    indiceInicioDesactivados + productosPorPagina
  );

  const Paginacion = ({ total, actual, setActual }) => {
    const totalPaginas = Math.ceil(total / productosPorPagina);
    if (totalPaginas <= 1) return null;

    return (
      <div className="flex justify-center items-center mt-4 gap-2 flex-wrap">
        <button
          onClick={() => setActual((prev) => Math.max(1, prev - 1))}
          disabled={actual === 1}
          className="px-3 py-1 border rounded bg-gray-300 hover:bg-gray-400"
        >
          Anterior
        </button>
        {[...Array(totalPaginas)].map((_, i) => (
          <button
            key={i}
            onClick={() => setActual(i + 1)}
            className={`px-3 py-1 rounded border ${
              actual === i + 1 ? "bg-gray-600 text-white" : "bg-white"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setActual((prev) => Math.min(totalPaginas, prev + 1))}
          disabled={actual === totalPaginas}
          className="px-3 py-1 border rounded bg-gray-300 hover:bg-gray-400"
        >
          Siguiente
        </button>
      </div>
    );
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    window.location.reload();
  };

  const handleModalOpen = () => {
    const sortedData = [...parsedData].sort(
      (a, b) => Number(a.id_producto) - Number(b.id_producto)
    );
    const lastItem = sortedData[sortedData.length - 1];
    const newId = lastItem ? Number(lastItem.id_producto) + 1 : 1;

    setNewProduct({
      id_producto: newId,
      nombre: "",
      cantidad: 0,
      categoria: "",
      codigoQr: "",
      estado: "activo",
      url_img: "",
      fecha_creacion: new Date().toISOString().split("T")[0], // Fecha solo, sin hora
    });

    setIsEditing(false);
    setSelectedFileName("");
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      setNewProduct((prevState) => ({
        ...prevState,
        url_img: file,
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "categoria") {
      setNewProduct((prevState) => ({
        ...prevState,
        categoria: { ...prevState.categoria, descripcion: value }, // Actualizar solo la descripcion
      }));
    } else {
      setNewProduct((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }

    // Mostrar sugerencias solo si se está escribiendo algo en la categoría
    if (value.trim() === "") {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    // destructuramos estado actual
    let {
      nombre,
      cantidad,
      categoria,
      url_img,
      estado,
      fecha_creacion,
      id_producto,
    } = newProduct;

    // validaciones
    if (!nombre.trim()) return alert("El nombre del producto es obligatorio.");
    if (!cantidad || isNaN(cantidad) || Number(cantidad) < 0)
      return alert("Cantidad no válida.");

    // gestionar categoría nueva vs existente
    let catSeleccionada = categoria;
    if (categoria.id === -1) {
      try {
        const { data } = await axios.post(
          "http://localhost:8080/api/categoria",
          { id: null, descripcion: categoria.descripcion }
        );
        catSeleccionada = data;
        // sincronizar state para mostrar el nuevo id
        setNewProduct((p) => ({ ...p, categoria: data }));
      } catch (err) {
        console.error(err);
        return alert("Error al crear la categoría.");
      }
    } else if (!categoria.id || isNaN(categoria.id)) {
      return alert("El ID de la categoría no es válido.");
    }

    if (!estado) return alert("El estado es obligatorio.");
    if (!fecha_creacion || isNaN(new Date(fecha_creacion).getTime()))
      return alert("La fecha de creación no es válida.");

    // construimos objeto producto (sin imagen)
    const fechaISO = new Date(fecha_creacion).toISOString();
    const productoSinImagen = {
      id_producto: isEditing ? id_producto : null,
      nombre,
      cantidad,
      id_categoria: catSeleccionada.id,
      estado,
      fecha_creacion: fechaISO,
    };

    // preparamos FormData
    const formData = new FormData();
    // en edición, si no viene File, mantenemos url_img existente
    if (isEditing) {
      if (url_img instanceof File) {
        formData.append("imagen", url_img);
      } else if (newProduct.url_img) {
        // mantenemos la propiedad en el objeto para el PUT
        productoSinImagen.url_img = newProduct.url_img;
      }
    } else {
      // en creación, obligamos a seleccionar archivo
      if (!(url_img instanceof File)) {
        return alert(
          "Debes seleccionar una imagen para crear un nuevo producto."
        );
      }
      formData.append("imagen", url_img);
    }

    formData.append(
      "producto",
      new Blob([JSON.stringify(productoSinImagen)], {
        type: "application/json",
      })
    );

    // enviamos la petición
    setOptions({
      method: isEditing ? "PUT" : "POST",
      body: formData,
    });

    // actualizamos lista local
    if (isEditing) {
      setParsedData((prev) =>
        prev.map((p) => (p.id_producto === id_producto ? productoSinImagen : p))
      );
    } else {
      setParsedData((prev) => [...prev, productoSinImagen]);
    }

    // cerramos modal y limpiamos
    setIsEditing(false);
    setIsModalOpen(false);
    setSelectedFileName("");
  };

  const handleEditProduct = (producto) => {
    // Formatear la fecha para que no tenga la parte de la hora
    const fechaSinHora = producto.fecha_creacion.split("T")[0]; // Esto deja solo la fecha

    setNewProduct({
      ...producto,
      fecha_creacion: fechaSinHora, // Aseguramos que solo tiene la fecha
    });

    setIsEditing(true);
    setSelectedFileName(producto.url_img?.name || "");
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (id_producto) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este producto?"
    );
    if (confirmDelete) {
      const token = localStorage.getItem("authToken"); // Obtener el token del localStorage

      if (!token) {
        alert(
          "No tienes permiso para eliminar el producto. No se encontró el token."
        );
        return;
      }

      // Hacer la solicitud DELETE al backend con el token
      fetch(`http://localhost:8080/api/producto/${id_producto}`, {
        // Ahora usas id_producto
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // Añadir el token en los headers
        },
      })
        .then((response) => {
          if (response.ok) {
            // Si la respuesta es exitosa, eliminar el producto de la lista local
            setParsedData((prevData) =>
              prevData.filter(
                (producto) => producto.id_producto !== id_producto
              )
            ); // Filtras por id_producto
            alert("Producto eliminado con éxito");
          } else {
            alert("Error al eliminar el producto");
          }
        })
        .catch((error) => {
          console.error("Error al eliminar el producto:", error);
          alert("Hubo un error al eliminar el producto");
        });
    }
  };
  const categoriasFiltradas = categorias.filter((cat) => {
    return (
      newProduct.categoria.descripcion &&
      cat.descripcion
        .toLowerCase()
        .includes(newProduct.categoria.descripcion.toLowerCase())
    );
  });

  const [isModalCategoriasOpen, setIsModalCategoriasOpen] = useState(false);
  const [isEditCategoriaOpen, setIsEditCategoriaOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  const handleModalOpenCategorias = () => {
    setIsModalCategoriasOpen(true);
  };

  const handleCategoriaInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedCategoria((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoriaSeleccionada = (categoria) => {
    setSelectedCategoria({ ...categoria });
    setIsEditCategoriaOpen(true);
  };

  const handleSaveCategoria = () => {
    fetch("http://localhost:8080/api/categoria", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedCategoria),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la solicitud");
        }
        return response.json();
      })
      .then((data) => {
        setIsEditCategoriaOpen(false);
        setIsModalCategoriasOpen(false);
      })
      .catch((error) => {
        console.error("Error al guardar la categoría:", error);
      });
  };

  return (
    <>
      <HeaderFuncional
        botones={["Añadir", "Editar Categoría"]}
        acciones={{
          Añadir: handleModalOpen,
          "Editar Categoría": handleModalOpenCategorias,
        }}
      />

      <div className="flex justify-center gap-4 mt-6">
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat, index) => (
            <option key={index} value={cat.descripcion}>
              {" "}
              {/* Acceder solo a descripcion */}
              {cat.descripcion} {/* Mostrar solo descripcion */}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Cantidad máxima"
          value={cantidadFiltro}
          onChange={(e) => setCantidadFiltro(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-5 mt-5 p-8">
        <div>
          <h2 className="text-2xl font-medium text-center mb-4">
            Productos Activos
          </h2>
          <div className="mb-4">
            <Paginacion
              total={productosActivos.length}
              actual={paginaActiva}
              setActual={setPaginaActiva}
            />
          </div>
          {productosActivosPaginados.length === 0 ? (
            <p>No hay productos activos.</p>
          ) : (
            productosActivosPaginados.map((producto) => (
              <div
                key={producto.id_producto}
                className="border border-gray-300 rounded-lg shadow-md text-center bg-green-50 p-4 mb-4 flex flex-col items-center"
              >
                <div className="flex w-full justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    {producto.nombre}
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditProduct(producto)}>
                      <img className="w-6 h-6" src="editar.png" alt="Editar" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(producto.id_producto)}
                    >
                      <img
                        className="w-6 h-6"
                        src="eliminar.png"
                        alt="Eliminar"
                      />
                    </button>
                  </div>
                </div>
                <img
                  src={"http://localhost:8080/imagen/" + producto.url_img}
                  alt={producto.nombre}
                  onClick={() => handleEditProduct(producto)}
                  className="w-24 h-24 object-cover rounded-md mb-4 mx-auto cursor-pointer hover:opacity-75 transition"
                />
                <p>
                  <strong>Cantidad:</strong> {producto.cantidad}
                </p>
                <p>
                  <strong>Categoría:</strong>{" "}
                  {producto.categoria?.descripcion || "Sin categoría"}
                </p>
                <p>
                  <strong>QR:</strong> {producto.codigoQr}
                </p>
              </div>
            ))
          )}
        </div>

        <div>
          <h2 className="text-2xl font-medium text-center mb-4">
            Productos Desactivados
          </h2>
          <div className="mb-4">
            <Paginacion
              total={productosDesactivados.length}
              actual={paginaDesactivada}
              setActual={setPaginaDesactivada}
            />
          </div>
          {productosDesactivadosPaginados.length === 0 ? (
            <p>No hay productos desactivados.</p>
          ) : (
            productosDesactivadosPaginados.map((producto) => (
              <div
                key={producto.id_producto}
                className="border border-gray-300 rounded-lg shadow-md text-center bg-red-50 p-4 mb-4 flex flex-col items-center"
              >
                <div className="flex w-full justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    {producto.nombre}
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditProduct(producto)}>
                      <img className="w-6 h-6" src="editar.png" alt="Editar" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(producto.id_producto)}
                    >
                      <img
                        className="w-6 h-6"
                        src="eliminar.png"
                        alt="Eliminar"
                      />
                    </button>
                  </div>
                </div>
                <img
                  src={"http://localhost:8080/imagen/" + producto.url_img}
                  alt={producto.nombre}
                  onClick={() => handleEditProduct(producto)}
                  className="w-24 h-24 object-cover rounded-md mb-4 mx-auto cursor-pointer hover:opacity-75 transition"
                />
                <p>
                  <strong>Cantidad:</strong> {producto.cantidad}
                </p>
                <p>
                  <strong>Categoría:</strong>{" "}
                  {producto.categoria?.descripcion || "Sin categoría"}
                </p>
                <p>
                  <strong>QR:</strong> {producto.codigoQr}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Listar y Editar Categoria */}
      {isModalCategoriasOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-2xl mb-4 text-center">Editar Categorías</h3>
            <ul className="mb-4 max-h-80 overflow-y-auto pr-2">
              {" "}
              {/* Aumento de altura */}
              {categorias.map((categoria) => (
                <li
                  key={categoria.id}
                  className="flex justify-between items-center mb-2"
                >
                  <p>{categoria.descripcion}</p>
                  <button
                    onClick={() => handleCategoriaSeleccionada(categoria)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Editar
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-center">
              <button
                onClick={() => setIsModalCategoriasOpen(false)}
                className="bg-red-300 text-black px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditCategoriaOpen && selectedCategoria && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-2xl mb-4 text-center">Editar Categoría</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium">ID</label>
              <input
                type="text"
                name="id"
                value={selectedCategoria.id}
                readOnly
                className="border p-2 rounded w-full bg-red-200 cursor-not-allowed"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Descripción</label>
              <input
                type="text"
                name="descripcion"
                value={selectedCategoria.descripcion}
                onChange={handleCategoriaInputChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setIsEditCategoriaOpen(false)}
                className="bg-red-300 text-black px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCategoria}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-2xl mb-4 text-center">
              {isEditing ? "Editar Producto" : "Añadir Producto"}
            </h3>
            <form encType="multipart/form-data" onSubmit={handleSaveProduct}>
              <div className="mb-4">
                <label className="block text-sm font-medium">ID</label>
                <input
                  type="text"
                  name="id"
                  value={newProduct.id_producto}
                  readOnly
                  className="border p-2 rounded w-full bg-red-200 cursor-not-allowed"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={newProduct.nombre}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  value={newProduct.cantidad}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Imagen</label>
                <div className="flex items-center space-x-4">
                  <label
                    htmlFor="fileUpload"
                    className="bg-red-700 opacity-75 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-900 transition"
                  >
                    Seleccionar archivo
                  </label>
                  <span className="text-sm text-gray-600">
                    {selectedFileName || "Ningún archivo seleccionado"}
                  </span>
                </div>
                <input
                  id="fileUpload"
                  type="file"
                  name="url_img"
                  onChange={handleFileChange}
                  className="hidden"
                  required={!isEditing}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Categoría</label>
                <div className="relative">
                  <input
                    type="text"
                    name="categoria"
                    value={newProduct.categoria.descripcion || ""}
                    id={newProduct.categoria.id}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 100)
                    }
                    className="border p-2 rounded w-full"
                    placeholder="Escribe una categoría"
                    required
                  />

                  {showSuggestions &&
                    newProduct.categoria.descripcion &&
                    (categoriasFiltradas.length > 0 ? (
                      <ul className="absolute bg-white border w-full mt-1 max-h-40 overflow-auto z-10">
                        {categoriasFiltradas.map((cat, index) => (
                          <li
                            key={index}
                            onClick={() => {
                              setNewProduct((prevState) => ({
                                ...prevState,
                                categoria: {
                                  descripcion: cat.descripcion,
                                  id: cat.id,
                                },
                              }));
                              setShowSuggestions(false);
                            }}
                            className="cursor-pointer px-2 py-1 hover:bg-gray-200"
                          >
                            {cat.descripcion + " (ID: " + cat.id + ")"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="absolute bg-white border w-full mt-1 max-h-40 overflow-auto z-10">
                        <li
                          onClick={() => {
                            setNewProduct((prevState) => ({
                              ...prevState,
                              categoria: null, // Aquí ponemos la categoría a null
                            }));
                            setShowSuggestions(false);
                          }}
                          className="cursor-pointer px-2 py-1 text-gree-600 hover:bg-gray-200"
                        >
                          <p className="hidden">
                            {" "}
                            {(newProduct.categoria.id = -1)}
                          </p>
                          Se creara una nueva categoría
                        </li>
                      </ul>
                    ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Estado</label>
                <select
                  name="estado"
                  value={newProduct.estado}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="activo">Activo</option>
                  <option value="desactivado">Desactivado</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Fecha de Creación
                </label>
                <input
                  type="date"
                  name="fecha_creacion"
                  value={newProduct.fecha_creacion}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="text-white bg-red-500 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded"
                >
                  {isEditing ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
