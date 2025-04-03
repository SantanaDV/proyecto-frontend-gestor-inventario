import useApi from './apiComunicator';

export default function Comunication({uri,opt}) {
  const { data, loading, error, setUri } = useApi(uri, opt);

  return <div>Respuesta: {error || JSON.stringify(data)}</div>;
}
