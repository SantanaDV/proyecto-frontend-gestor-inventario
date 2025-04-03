import useApi from './apiComunicator';

export default function Comunication({ uri, opt, render }) {
  const { data, loading, error } = useApi(uri, opt);

  return (
    <>
      {render ? render({ data, loading, error }) : <p>Respuesta: {error || JSON.stringify(data)}</p>}
    </>
  );
}
