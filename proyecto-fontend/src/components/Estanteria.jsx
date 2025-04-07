import React from 'react';
import { Rect, Text, Group } from 'react-konva';

const Estanteria = ({ x, y, width, height, id, onDragEnd }) => {
  return (
    <Group x={x} y={y} draggable onDragEnd={onDragEnd}>
      <Rect width={width} height={height} fill="orange" stroke="black" strokeWidth={2} />
      <Text text={id} fontSize={12} x={5} y={5} />
    </Group>
  );
};

export default Estanteria;
