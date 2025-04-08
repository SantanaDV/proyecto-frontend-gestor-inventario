import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Group, Text } from 'react-konva';
import { saveToStorage } from '../utilities/storage.JSX';
import { loadFromStorage } from '../utilities/storage.JSX';

export default function AlmacenVisual() {
  const [gridSize, setGridSize] = useState('');
  const [warehouseSize, setWarehouseSize] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [showError, setShowError] = useState(false);
  const [cellSize, setCellSize] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showGrid, setShowGrid] = useState(true);

  const padding = 20;
  const adjustedWidth = window.innerWidth - padding;

  useEffect(() => {
    const savedSize = loadFromStorage('warehouseSize');
    const savedShelves = loadFromStorage('shelves', []);
    if (savedSize) {
      setWarehouseSize(savedSize);
      setWindowWidth(window.innerWidth);
      setCellSize((window.innerWidth - padding) / savedSize.gridCount);
    }
    setShelves(savedShelves);
  }, []);

  useEffect(() => {
    if (warehouseSize) {
      saveToStorage('warehouseSize', warehouseSize);
      setCellSize(adjustedWidth / warehouseSize.gridCount);
    }
  }, [warehouseSize, adjustedWidth]);

  useEffect(() => {
    saveToStorage('shelves', shelves);
  }, [shelves]);

  const handleGridSubmit = (e) => {
    e.preventDefault();
    const n = parseInt(gridSize);
    if (isNaN(n) || n <= 0) {
      setShowError(true);
      return;
    }
    setShowError(false);
    const size = {
      gridCount: n,
      width: adjustedWidth,
      height: n * (adjustedWidth / n),
    };
    setWarehouseSize(size);
    setCellSize(adjustedWidth / n);
    saveToStorage('warehouseSize', size);
  };

  const addShelf = (orientation = 'horizontal') => {
    const usedPositions = shelves.map(s => `${s.row}-${s.col}`);
    for (let i = 0; i < warehouseSize.gridCount ** 2; i++) {
      const row = Math.floor(i / warehouseSize.gridCount);
      const col = i % warehouseSize.gridCount;
      const key = `${row}-${col}`;
      if (!usedPositions.includes(key)) {
        const id = `Estantería-${Date.now()}`;
        const width = orientation === 'horizontal' ? cellSize * 2 : cellSize;
        const height = orientation === 'vertical' ? cellSize * 2 : cellSize;

        const newShelf = {
          id,
          orientation,
          row,
          col,
          x: col * cellSize,
          y: row * cellSize,
          width: width,
          height: height
        };
        setShelves([...shelves, newShelf]);
        break;
      }
    }
  };

  const moveShelf = (e, id) => {
    const pos = e.target.position();
    const newCol = Math.floor(pos.x / cellSize);
    const newRow = Math.floor(pos.y / cellSize);

    if (
      newCol >= 0 && newCol < warehouseSize.gridCount &&
      newRow >= 0 && newRow < warehouseSize.gridCount
    ) {
      const isOccupied = shelves.some(
        (s) => s.id !== id && s.row === newRow && s.col === newCol
      );

      if (!isOccupied) {
        const updatedShelves = shelves.map(shelf => {
          if (shelf.id === id) {
            return {
              ...shelf,
              row: newRow,
              col: newCol,
              x: newCol * cellSize,
              y: newRow * cellSize,
            };
          }
          return shelf;
        });
        setShelves(updatedShelves);
      } else {
        const original = shelves.find(s => s.id === id);
        e.target.to({
          x: original.col * cellSize,
          y: original.row * cellSize,
          duration: 0.1,
        });
      }
    }
  };

  const resetWarehouse = () => {
    localStorage.removeItem('warehouseSize');
    localStorage.removeItem('shelves');
    setWarehouseSize(null);
    setShelves([]);
    setGridSize('');
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  if (!warehouseSize) {
    return (
      <form onSubmit={handleGridSubmit} className="p-4">
        <label className="block">Tamaño de la cuadrícula (NxN):
          <input
            type="number"
            value={gridSize}
            onChange={(e) => setGridSize(e.target.value)}
            className="border mx-2 p-1"
            required
          />
        </label>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2">Crear Almacén</button>
        {showError && <p className="text-red-500 mt-2">Por favor, ingresa un número válido.</p>}
      </form>
    );
  }

  return (
    <div>
      <div className="p-2 space-x-2">
        <button onClick={() => addShelf('horizontal')} className="bg-green-500 text-white px-3 py-1">Agregar Estantería Horizontal</button>
        <button onClick={() => addShelf('vertical')} className="bg-blue-500 text-white px-3 py-1">Agregar Estantería Vertical</button>
        <button onClick={resetWarehouse} className="bg-red-500 text-white px-3 py-1 ml-4">Resetear Almacén</button>
        <button onClick={toggleGrid} className="bg-yellow-500 text-white px-3 py-1 ml-4">
          {showGrid ? 'Ocultar Cuadrícula' : 'Mostrar Cuadrícula'}
        </button>
      </div>
      <Stage
        width={warehouseSize.width}
        height={warehouseSize.height}
        className="border m-2"
        style={{ display: 'block', overflow: 'hidden' }}
      >
        <Layer>
          {showGrid && [...Array(warehouseSize.gridCount)].map((_, row) =>
            [...Array(warehouseSize.gridCount)].map((_, col) => (
              <Rect
                key={`cell-${row}-${col}`}
                x={col * cellSize}
                y={row * cellSize}
                width={cellSize}
                height={cellSize}
                stroke="#ccc"
              />
            ))
          )}
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
                fontSize={10}
                x={2}
                y={2}
                width={shelf.width}
                height={shelf.height}
                align="center"
                verticalAlign="middle"
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
