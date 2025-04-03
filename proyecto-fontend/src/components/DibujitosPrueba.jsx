import React, { useState } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';

function DrawingApp() {
  const [rectangles, setRectangles] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState(null); // Estado para el rectángulo en dibujo

  const startDrawing = (e) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    // Prevenir la superposición con otras estanterías
    if (!checkCollision(pos.x, pos.y)) {
      setCurrentRect({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        id: Date.now(), // Cada rectángulo tendrá un ID único
      });
    }
  };

  const drawRect = (e) => {
    if (!isDrawing) return;

    const pos = e.target.getStage().getPointerPosition();
    const newWidth = pos.x - currentRect.x;
    const newHeight = pos.y - currentRect.y;

    setCurrentRect({
      ...currentRect,
      width: newWidth,
      height: newHeight,
    });
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (currentRect) {
      setRectangles([...rectangles, currentRect]);
    }
    setCurrentRect(null); // Reseteamos el rectángulo en proceso
  };

  const moveRect = (e, id) => {
    const pos = e.target.getStage().getPointerPosition();
    setRectangles((prev) =>
      prev.map((rect) =>
        rect.id === id
          ? { ...rect, x: pos.x - rect.width / 2, y: pos.y - rect.height / 2 }
          : rect
      )
    );
  };

  const checkCollision = (x, y) => {
    // Verifica que la nueva estantería no se superponga con otras
    return rectangles.some((rect) => {
      const isInXRange = x >= rect.x && x <= rect.x + rect.width;
      const isInYRange = y >= rect.y && y <= rect.y + rect.height;
      return isInXRange && isInYRange;
    });
  };

  const handleButtonClick = (rectId) => {
    alert(`Botón dentro de la estantería ${rectId} clickeado!`);
    // Aquí puedes agregar más lógica para interactuar con la estantería
  };

  const saveDrawing = () => {
    console.log("Guardar dibujo!");
    // Aquí puedes guardar el lienzo
  };

  return (
    <div style={{ position: 'relative' }}>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={startDrawing}
        onMouseMove={drawRect}
        onMouseUp={endDrawing}
      >
        <Layer>
          {/* Mostrar los rectángulos dibujados */}
          {rectangles.map((rect) => (
            <Group
              key={rect.id}
              x={rect.x}
              y={rect.y}
              draggable
              onDragMove={(e) => moveRect(e, rect.id)} // Permite mover las estanterías
            >
              <Rect
                width={rect.width}
                height={rect.height}
                fill="red"
                stroke="black"  // Borde negro
                strokeWidth={3}  // Ancho del borde
              />
              <Text
                x={rect.width / 4}
                y={rect.height / 8}  // Ajusta la posición del texto
                text="Estantería"  // Texto dentro de la estantería
                fontSize={20}
                fill="black"
                width={rect.width / 2}
                height={rect.height / 2}
                align="center"
                verticalAlign="middle"
              />
            </Group>
          ))}

          {/* Mostrar el rectángulo en proceso */}
          {currentRect && (
            <Rect
              x={currentRect.x}
              y={currentRect.y}
              width={currentRect.width}
              height={currentRect.height}
              fill="rgba(255, 0, 0, 0.5)"
              stroke="black"  // Borde negro para el rectángulo en proceso
              strokeWidth={3}
            />
          )}
        </Layer>
      </Stage>

      {/* Botón HTML real dentro del rectángulo */}
      {rectangles.map((rect) => (
        <div
          key={`button-${rect.id}`}
          onClick={() => handleButtonClick(rect.id)}
          style={{
            position: 'absolute',
            left: rect.x + rect.width / 4, // Ajusta la posición horizontal
            top: rect.y + rect.height / 2, // Ajusta la posición vertical
            width: rect.width / 2,
            height: rect.height / 4,
            backgroundColor: 'white',
            border: '2px solid black',
            textAlign: 'center',
            lineHeight: `${rect.height / 4}px`,
            cursor: 'pointer',
          }}
        >
          Botón
        </div>
      ))}

      <button onClick={saveDrawing}>Guardar Dibujo</button>
    </div>
  );
}

export default DrawingApp;
