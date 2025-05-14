/**
 * @fileoverview Página de gestión de almacén
 * Muestra el componente visual del almacén
 */

import HeaderFuncional from "../components/HeaderFuncional"
import AlmacenVisual from "../components/AlmacenVisual"

/**
 * Página de gestión de almacén
 * @returns {JSX.Element} Componente renderizado
 */
export default function Almacen() {
  return (
    <div>
      <HeaderFuncional />
      <AlmacenVisual />
    </div>
  )
}
