import React, { useMemo } from 'react'
import Comunication from '../utilities/comunication';


export default function Inventario() {
  const options = useMemo(() => ({}), []);
  return (
    <div>PRODUCTOS: 
      
    <Comunication
      uri={"/producto"}
      opt={options}
  />


  </div>

  )
}
