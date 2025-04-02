import { useState, useEffect } from 'react';
import axios from 'axios';

const useApi = (endpoint, options = {}) => {
  const baseUrl = 'http://localhost:8080/api'; 
  const [uri, setUri] = useState(`${baseUrl}${endpoint}`); 
  console.log(baseUrl+endpoint)
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!uri) return;

      try {
        setLoading(true);
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
          

        setData(response.data);
      } catch (err) {
        console.error("Axios Error:", err);
        if (err.response) {
          setError(`Error ${err.response.status}: ${err.response.data}`);
        } else if (err.request) {
          setError("No response received from the server");
        } else {
          setError(err.message);
        }
      }
    };

    fetchData();
  }, [uri, options]);

  return { data, loading, error, setUri }; 
};

export default useApi;
