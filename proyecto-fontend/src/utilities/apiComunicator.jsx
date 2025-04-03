import { useState, useEffect } from 'react';
import axios from 'axios';

const useApi = (endpoint, options = {}) => {
  const baseUrl = 'http://localhost:8080/api'; 
  const [uri, setUri] = useState(`${baseUrl}${endpoint}`); 
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!uri) return;

      try {
        setLoading(true); // Empezamos a cargar
        const response = await axios({
          url: uri,
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
          withCredentials: true,
          data: options.body || undefined,
        });

        setData(response.data); // Establecemos los datos
        setError(null); // Limpia errores previos
      } catch (err) {
        console.error("Axios Error:", err);
        if (err.response) {
          setError(`Error ${err.response.status}: ${err.response.data}`);
        } else if (err.request) {
          setError("No response received from the server");
        } else {
          setError(err.message);
        }
        setData(null); // Evita mostrar datos erróneos
      } finally {
        setLoading(false); // Termina el estado de carga
      }
    };

    fetchData(); // Llamamos la función para hacer la solicitud
  }, []); // Solo se ejecuta una vez, cuando el componente se monta

  return { data, loading, error, setUri }; 
};

export default useApi;
