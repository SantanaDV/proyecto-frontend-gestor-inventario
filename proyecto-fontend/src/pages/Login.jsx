import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importar el hook useNavigate

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Obtener el método para navegar

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simular un inicio de sesión exitoso (aquí deberías validar las credenciales)
    if (email && password) {
      // Redirigir a la página de inicio (Home)
      navigate("/home");
    } else {
      alert("Por favor, ingresa tus credenciales.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-500 font-sans px-4">
      <div className="mb-6">
        <img 
          src="logo.png" 
          alt="Login Header" 
          className="w-60 h-auto rounded-t-2xl" 
        />
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-[0px_14px_80px_rgba(34,35,58,0.2)] p-10 transition-all">
        <h3 className="text-center text-xl font-semibold mb-6">Iniciar Sesion</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Introduce direccion de correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Actualiza el estado del email
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Introduce tu constraseñas"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Actualiza el estado de la contraseña
            />
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              className="mr-2 accent-blue-500"
              id="rememberMe"
            />
            <label htmlFor="rememberMe" className="text-sm font-normal">
              Recordar mi Sesion
            </label>
          </div>

          <div className="mb-3">
            <button
              type="submit"
              className="w-full bg-red-700 text-white py-2 rounded-md hover:bg-red-900 transition-colors"
            >
              Iniciar Sesion
            </button>
          </div>

          <p className="text-right text-sm text-gray-500">
            Olvidaste tu{" "}
            <a href="#" className="text-red-600 hover:underline">
              Contraseña?
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
