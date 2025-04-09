import React, { useState, useEffect } from "react";

export default function AlmacenVisual() {
  const [gridSize, setGridSize] = useState("");
  const [warehouseSize, setWarehouseSize] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [showError, setShowError] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    const savedSize = localStorage.getItem("warehouseSize");
    const savedShelves = JSON.parse(localStorage.getItem("shelves") || "[]");
    if (savedSize) {
      setWarehouseSize(JSON.parse(savedSize));
    }
    setShelves(savedShelves);
  }, []);

  useEffect(() => {
    if (warehouseSize) {
      localStorage.setItem("warehouseSize", JSON.stringify(warehouseSize));
    }
  }, [warehouseSize]);

  useEffect(() => {
    localStorage.setItem("shelves", JSON.stringify(shelves));
  }, [shelves]);

  const handleGridSubmit = (e) => {
    e.preventDefault();
    const n = parseInt(gridSize);
    if (isNaN(n) || n <= 0) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setWarehouseSize({ gridCount: n });
  };

  const addShelf = (orientation = "horizontal") => {
    const newShelf = {
      id: `Estantería-${Date.now()}`,
      orientation,
      position: { row: 0, col: 0 },
    };
    setShelves([...shelves, newShelf]);
  };

  const moveShelf = (id, newRow, newCol, newOrientation = null) => {
    const updatedShelves = shelves.map((shelf) => {
      if (shelf.id === id) {
        return {
          ...shelf,
          position: { row: newRow, col: newCol },
          orientation: newOrientation || shelf.orientation,
        };
      }
      return shelf;
    });
    setShelves(updatedShelves);
  };

  const resetWarehouse = () => {
    localStorage.removeItem("warehouseSize");
    localStorage.removeItem("shelves");
    setWarehouseSize(null);
    setShelves([]);
    setGridSize("");
  };

  const onDragStart = (e, shelf) => {
    e.dataTransfer.setData("shelfId", shelf.id);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, row, col) => {
    e.preventDefault();
    const shelfId = e.dataTransfer.getData("shelfId");
    const shelf = shelves.find((s) => s.id === shelfId);
    if (!shelf) return;

    const fitsInBounds =
      shelf.orientation === "horizontal"
        ? col + 1 < warehouseSize.gridCount
        : row + 1 < warehouseSize.gridCount;

    if (!fitsInBounds) return;

    const conflict = shelves.some((other) => {
      if (other.id === shelf.id) return false;
      const { row: or, col: oc, orientation: oo } = other;

      if (oo === "horizontal") {
        return (
          (or === row && (oc === col || oc + 1 === col)) ||
          (or === row && oc === col - 1)
        );
      } else {
        return (
          (oc === col && (or === row || or + 1 === row)) ||
          (oc === col && or === row - 1)
        );
      }
    });

    let updatedShelf = { ...shelf };
    if (conflict && shelf.orientation === "horizontal") {
      updatedShelf.orientation = "vertical";
    }

    moveShelf(updatedShelf.id, row, col, updatedShelf.orientation);
  };

  const toggleGrid = () => setShowGrid(!showGrid);

  if (!warehouseSize) {
    return (
      <form onSubmit={handleGridSubmit} className="p-4">
        <label className="block">
          Tamaño de la cuadrícula (NxN):
          <input
            type="number"
            value={gridSize}
            onChange={(e) => setGridSize(e.target.value)}
            className="border mx-2 p-1"
            required
          />
        </label>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2">
          Crear Almacén
        </button>
        {showError && (
          <p className="text-red-500 mt-2">
            Por favor, ingresa un número válido.
          </p>
        )}
      </form>
    );
  }

  return (
    <div>
      <div className="p-2 space-x-2">
        <button
          onClick={() => addShelf("horizontal")}
          className="bg-green-500 text-white px-3 py-1"
        >
          Agregar Estantería Horizontal
        </button>
        <button
          onClick={() => addShelf("vertical")}
          className="bg-blue-500 text-white px-3 py-1"
        >
          Agregar Estantería Vertical
        </button>
        <button
          onClick={resetWarehouse}
          className="bg-red-500 text-white px-3 py-1 ml-4"
        >
          Resetear Almacén
        </button>
        <button
          onClick={toggleGrid}
          className="bg-yellow-500 text-white px-3 py-1 ml-4"
        >
          {showGrid ? "Ocultar Cuadrícula" : "Mostrar Cuadrícula"}
        </button>
      </div>

      {showGrid && (
        <table className="border-collapse w-full table-fixed">
          <tbody>
            {(() => {
              const gridCount = warehouseSize.gridCount;
              return [...Array(gridCount)].map((_, row) => (
                <tr key={row}>
                  {[...Array(gridCount)].map((_, col) => {
                    const shelf = shelves.find(
                      (s) => s.position.row === row && s.position.col === col
                    );

                    const isShelf = !!shelf;
                    const isHorizontal = shelf?.orientation === "horizontal";
                    const isVertical = shelf?.orientation === "vertical";

                    return (
                      <td
                        key={`${row}-${col}`}
                        className={`border transition-all duration-300 ease-in-out 
                          ${isShelf ? (isHorizontal ? "w-40 h-12" : "w-20 h-24") : "w-40 h-12"}
                        `}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, row, col)}
                      >
                        {isShelf && (
                          <label
                            draggable
                            onDragStart={(e) => onDragStart(e, shelf)}
                            className="block w-full h-full bg-orange-500 text-white text-xs text-center flex justify-center items-center cursor-move"
                          >
                            {shelf.id}
                          </label>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ));
            })()}
          </tbody>
        </table>
      )}
    </div>
  );
}
