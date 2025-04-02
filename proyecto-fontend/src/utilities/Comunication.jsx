import { useMemo } from 'react';
import useApi from './apiComunicator';

export default function Comunication() {
  const options = useMemo(() => ({}), []); // o define las opciones reales
  const { data, loading, error, setUri } = useApi('/tarea', options);

  return <div>Respuesta: {error || JSON.stringify(data)}</div>;
}
