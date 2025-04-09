import React from 'react';
import HeaderFuncional from '../components/HeaderFuncional';  // Header si es necesario
import AlmacenVisual from '../components/AlmacenVisual';  // Importamos el componente visual del almacén

export default function Almacen() {
  return (
    <div>
      <HeaderFuncional />
      <AlmacenVisual />
    </div>
  );
}
