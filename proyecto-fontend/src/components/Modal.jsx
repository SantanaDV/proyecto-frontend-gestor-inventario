import React, { useState } from "react";

const Modal = ({ isOpen, onClose, onSubmit, newUserName, setNewUserName }) => {
  const [errorMessage, setErrorMessage] = useState("");

  const handleChangeUserName = () => {
    if (!newUserName.trim()) {
      setErrorMessage("El nombre no puede estar vacío.");
      return;
    }
  
    const token = localStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail");
  
    if (!email || !token) {
      setErrorMessage("Email o token no encontrado.");
      return;
    }
  
    fetch(`http://localhost:8080/api/usuario/modificar?email=${email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nombre: newUserName }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error en la actualización del nombre: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        // Imprimir la respuesta para asegurarse de que estamos recibiendo los datos correctos
        console.log("Respuesta del servidor:", data);
      
        // Verificar si la respuesta tiene la propiedad 'nombre'
        if (data && data.nombre && data.nombre.trim() === newUserName.trim()) {
          localStorage.setItem("userName", newUserName); // Guardar el nuevo nombre en localStorage
          onSubmit(); // Llamamos a la función onSubmit
          onClose(); // Cerramos el modal
        } else {
          // Si los datos no coinciden o no se actualiza correctamente, mostrar el mensaje de error
          console.error("Error: El nombre no se actualizó correctamente.");
          setErrorMessage("Error al actualizar el nombre. Intente nuevamente.");
        }
      })
      .catch((err) => {
        console.error("Error al modificar el nombre:", err);
        setErrorMessage("Error al actualizar el nombre.");
      });
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-xl font-semibold mb-4">Modificar Nombre de Usuario</h3>
        {errorMessage && (
          <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
        )}
        <div>
          <label htmlFor="newUserName" className="block font-medium mb-2">
            Nuevo Nombre
          </label>
          <input
            type="text"
            id="newUserName"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Introduce tu nuevo nombre"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-between">
          <button
            onClick={handleChangeUserName}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Guardar Cambios
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
