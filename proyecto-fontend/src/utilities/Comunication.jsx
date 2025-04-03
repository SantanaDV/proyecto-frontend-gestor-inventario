import useApi from './apiComunicator';

export default function Comunication({ uri, opt, render }) {
  const { data, loading, error,setLoading } = useApi(uri, opt);

  return (
    <>
      {render ? render({ data, loading, error,setLoading }) : <p>Respuesta: {error || JSON.stringify(data)}</p>}
    </>
  );
}
