import React from 'react';
import HeaderFuncional from '../components/HeaderFuncional';  // Header si es necesario
import AlmacenVisual from '../components/AlmacenVisual';  // Importamos el componente visual del almacén
import { useNavigate } from "react-router-dom";
export default function Almacen() {
  const navigate = useNavigate();
  if (!localStorage.getItem("authToken")) {
    navigate('/login');
  }

  return (
    <div>
      <HeaderFuncional />
      <AlmacenVisual />
    </div>
  );
}
