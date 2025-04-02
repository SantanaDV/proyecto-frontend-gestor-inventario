import React from 'react'
import useApi from './apiComunicator'
export default function Comunication() {
  const { data, loading, error,setUri } = useApi('/tarea',{});
  return (
    <div> Respuesta: {error} </div>
  )
}
