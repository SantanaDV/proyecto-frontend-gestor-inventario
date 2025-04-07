// components/AlmacenVisual.jsx
import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Group, Text } from 'react-konva';
import { saveToStorage } from '../utilities/storage.JSX';
import { loadFromStorage } from '../utilities/storage.JSX';

export default function AlmacenVisual() {
  const [dimensions, setDimensions] = useState({ width: '', height: '' });
  const [warehouseSize, setWarehouseSize] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [showError, setShowError] = useState(false);

  // Cargar datos guardados desde el almacenamiento local
  useEffect(() => {
    const savedSize = loadFromStorage('warehouseSize');
    const savedShelves = loadFromStorage('shelves', []);
    if (savedSize) setWarehouseSize(savedSize);
    setShelves(savedShelves);
  }, []);

  useEffect(() => {
    if (warehouseSize) saveToStorage('warehouseSize', warehouseSize);
  }, [warehouseSize]);

  useEffect(() => {
    saveToStorage('shelves', shelves);
  }, [shelves]);

  const handleSizeSubmit = (e) => {
    e.preventDefault();
    if (dimensions.width <= 0 || dimensions.height <= 0) {
      setShowError(true);
      return;
    }

    setShowError(false);
    const size = {
      width: window.innerWidth,  // Establecemos el ancho como el ancho de la página
      height: (window.innerWidth / 20) * dimensions.height  // Calculamos la altura proporcional
    };
    setWarehouseSize(size);
    saveToStorage('warehouseSize', size);
  };

  const addShelf = (orientation) => {
    const id = `Estantería-${Date.now()}`;
    const newShelf = {
      id,
      x: 50,
      y: 50,
      width: orientation === 'horizontal' ? 100 : 20,
      height: orientation === 'horizontal' ? 20 : 100,
      orientation,
    };
    setShelves([...shelves, newShelf]);
  };

  const moveShelf = (e, id) => {
    const pos = e.target.position();
    setShelves(prev => prev.map(shelf => shelf.id === id ? { ...shelf, ...pos } : shelf));
  };

  const resetWarehouse = () => {
    localStorage.removeItem('warehouseSize');
    localStorage.removeItem('shelves');
    setWarehouseSize(null);
    setShelves([]);
  };

  if (!warehouseSize) {
    return (
      <form onSubmit={handleSizeSubmit} className="p-4">
        <label className="block">Ancho:
          <input
            type="number"
            value={dimensions.width}
            onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
            className="border mx-2 p-1"
            required
          />
        </label>
        <label className="block mt-2">Alto:
          <input
            type="number"
            value={dimensions.height}
            onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
            className="border mx-2 p-1"
            required
          />
        </label>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2">Crear Almacén</button>
        {showError && <p className="text-red-500 mt-2">Por favor, ingresa valores válidos para el ancho y alto.</p>}
      </form>
    );
  }

  return (
    <div>
      <div className="p-2 space-x-2">
        <button onClick={() => addShelf('horizontal')} className="bg-green-500 text-white px-3 py-1">Agregar Horizontal</button>
        <button onClick={() => addShelf('vertical')} className="bg-green-500 text-white px-3 py-1">Agregar Vertical</button>
        <button onClick={resetWarehouse} className="bg-red-500 text-white px-3 py-1 ml-4">Resetear Almacén</button>
      </div>
      <Stage width={warehouseSize.width} height={warehouseSize.height} className="border m-2">
        <Layer>
          {shelves.map((shelf) => (
            <Group
              key={shelf.id}
              x={shelf.x}
              y={shelf.y}
              draggable
              onDragEnd={(e) => moveShelf(e, shelf.id)}
            >
              <Rect 
                width={shelf.width} 
                height={shelf.height} 
                fill="orange" 
                stroke="black" 
                strokeWidth={2} 
              />
              <Text
                text={shelf.id}
                fontSize={12}
                x={5}
                y={5}
                rotation={shelf.orientation === 'vertical' ? 0 : 0}  // Rotar el texto para estanterías verticales
                width={shelf.width}
                height={shelf.height}
                verticalAlign="middle"
                align="center"
                wrap="word"
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
