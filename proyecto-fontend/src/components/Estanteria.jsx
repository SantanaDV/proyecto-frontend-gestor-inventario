"use client"

/**
 * @fileoverview Componente que representa una estantería individual en el sistema de almacén.
 * Muestra información sobre la estantería y permite interactuar con ella.
 *
 * @component Estanteria
 * @requires React
 * @requires react-router-dom
 */

import { Rect, Text, Group } from "react-konva"

/**
 * Componente que renderiza una estantería individual con sus propiedades.
 * Permite visualizar el estado de la estantería y acceder a sus detalles.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.estanteria - Datos de la estantería a mostrar
 * @param {string} props.estanteria.id - Identificador único de la estantería
 * @param {string} props.estanteria.nombre - Nombre de la estantería
 * @param {number} props.estanteria.capacidad - Capacidad total de la estantería
 * @param {number} props.estanteria.ocupacion - Nivel de ocupación actual de la estantería
 * @param {Function} props.onClick - Función a ejecutar cuando se hace clic en la estantería
 * @returns {JSX.Element} Representación visual de una estantería
 */
const Estanteria = ({ x, y, width, height, id, onDragEnd }) => {
  return (
    <Group x={x} y={y} draggable onDragEnd={onDragEnd}>
      {/* Rectángulo que representa la estantería */}
      <Rect width={width} height={height} fill="orange" stroke="black" strokeWidth={2} />

      {/* Texto con el ID de la estantería */}
      <Text text={id} fontSize={12} x={5} y={5} />
    </Group>
  )
}

export default Estanteria