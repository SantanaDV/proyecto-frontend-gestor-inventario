import React from 'react'
import Comunication from '../utilities/comunication'
import { useMemo } from 'react';
export default function Home() {
  const options = useMemo(() => ({}), []);

  return (
    <div>Almacen: 
      
      <Comunication
        uri={"/tarea"}
        opt={options}
    />


    </div>
  )
}
