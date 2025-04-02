import React, { useMemo } from 'react'
import Comunication from '../utilities/comunication';

export default function Tareas() {
  const options = useMemo(() => ({}), []);
  
  return (
    <div>TAREAS: 
      
    <Comunication
      uri={"/tarea"}
      opt={options}
  />


  </div>
  )
}
