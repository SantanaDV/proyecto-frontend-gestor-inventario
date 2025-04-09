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
      setWarehouseSize(savedSize);
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
    const size = { gridCount: n };
    setWarehouseSize(size);
  };

  const addShelf = (orientation = "horizontal") => {
    const newShelf = {
      id: `Estantería-${Date.now()}`,
      orientation,
      position: { row: 0, col: shelves.length }, // Simple logic for positions
    };
    setShelves([...shelves, newShelf]);
  };

  const moveShelf = (id, newRow, newCol) => {
    const updatedShelves = shelves.map((shelf) => {
      if (shelf.id === id) {
        return {
          ...shelf,
          position: { row: newRow, col: newCol },
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
    e.dataTransfer.setData("shelfId", shelf.id); // Store the ID of the shelf being dragged
  };

  const onDragOver = (e) => {
    e.preventDefault(); // Prevent default to allow dropping
  };

  const onDrop = (e, row, col) => {
    e.preventDefault();
    const shelfId = e.dataTransfer.getData("shelfId"); // Get the ID of the dragged shelf
    const shelf = shelves.find((shelf) => shelf.id === shelfId);
    if (shelf) {
      moveShelf(shelf.id, row, col);
    }
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

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
        {showError && <p className="text-red-500 mt-2">Por favor, ingresa un número válido.</p>}
      </form>
    );
  }

  return (
    <div>
      <div className="p-2 space-x-2">
        <button onClick={() => addShelf("horizontal")} className="bg-green-500 text-white px-3 py-1">
          Agregar Estantería Horizontal
        </button>
        <button onClick={() => addShelf("vertical")} className="bg-blue-500 text-white px-3 py-1">
          Agregar Estantería Vertical
        </button>
        <button onClick={resetWarehouse} className="bg-red-500 text-white px-3 py-1 ml-4">
          Resetear Almacén
        </button>
        <button onClick={toggleGrid} className="bg-yellow-500 text-white px-3 py-1 ml-4">
          {showGrid ? "Ocultar Cuadrícula" : "Mostrar Cuadrícula"}
        </button>
      </div>

      {showGrid && (
        <table
          className="border-collapse"
          style={{ width: "100%", tableLayout: "fixed" }}
        >
          <tbody>
            {[...Array(warehouseSize.gridCount)].map((_, row) => (
              <tr key={row}>
                {[...Array(warehouseSize.gridCount)].map((_, col) => (
                  <td
                    key={`${row}-${col}`}
                    style={{
                      border: "1px solid #ccc",
                      width: `${100 / warehouseSize.gridCount}%`,
                      height: "50px",
                      position: "relative",
                    }}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, row, col)}
                  >
                    {shelves.map(
                      (shelf) =>
                        shelf.position.row === row && shelf.position.col === col && (
                          <div
                            key={shelf.id}
                            className={`absolute ${shelf.orientation === "horizontal" ? "w-20" : "w-10"} ${
                              shelf.orientation === "vertical" ? "h-20" : "h-10"
                            } bg-orange-500`}
                            draggable
                            onDragStart={(e) => onDragStart(e, shelf)}
                          >
                            <span
                              className="text-white text-xs absolute inset-0 flex justify-center items-center"
                            >
                              {shelf.id}
                            </span>
                          </div>
                        )
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
