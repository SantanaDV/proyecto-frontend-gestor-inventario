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
      try {
        const parsedSize = JSON.parse(savedSize);
        setWarehouseSize(parsedSize);
        setGridSize(parsedSize.gridCount.toString());
      } catch (error) {
        console.error("Error al parsear warehouseSize", error);
      }
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
    if (!warehouseSize) return;

    let found = false;
    let newRow = 0;
    let newCol = 0;

    for (let row = 0; row < warehouseSize.gridCount; row++) {
      for (let col = 0; col < warehouseSize.gridCount; col++) {
        const fits =
          orientation === "horizontal"
            ? col < warehouseSize.gridCount - 1
            : row < warehouseSize.gridCount - 1;

        if (!fits) continue;

        const conflict = shelves.some((s) => {
          const { row: sr, col: sc } = s.position;
          const so = s.orientation;

          if (so === "horizontal") {
            return (
              (sr === row && sc === col) ||
              (sr === row && sc === col + 1)
            );
          } else {
            return (
              (sc === col && sr === row) ||
              (sc === col && sr === row + 1)
            );
          }
        });

        if (!conflict) {
          newRow = row;
          newCol = col;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      alert("No hay espacio disponible para una nueva estantería.");
      return;
    }

    const newShelf = {
      id: `Estantería-${Date.now()}`,
      orientation,
      position: { row: newRow, col: newCol },
    };
    setShelves([...shelves, newShelf]);
  };

  const moveShelf = (id, newRow, newCol, newOrientation = null) => {
    const updatedShelves = shelves.map((shelf) =>
      shelf.id === id
        ? {
            ...shelf,
            position: { row: newRow, col: newCol },
            orientation: newOrientation || shelf.orientation,
          }
        : shelf
    );
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
        ? col < warehouseSize.gridCount - 1
        : row < warehouseSize.gridCount - 1;

    if (!fitsInBounds) return;

    const conflict = shelves.some((other) => {
      if (other.id === shelf.id) return false;
      const { row: or, col: oc } = other.position;
      const oo = other.orientation;

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

    if (conflict) return;

    moveShelf(shelf.id, row, col);
  };

  const toggleGrid = () => setShowGrid(!showGrid);

  if (!warehouseSize || !warehouseSize.gridCount) {
    return (
      <form onSubmit={handleGridSubmit} className="p-4">
        <label className="block mb-2">
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

      <table className="border-collapse w-full table-fixed">
        <tbody>
          {[...Array(warehouseSize.gridCount)].map((_, row) => (
            <tr key={row}>
              {[...Array(warehouseSize.gridCount)].map((_, col) => {
                const shelf = shelves.find(
                  (s) => s.position.row === row && s.position.col === col
                );
                const isShelf = !!shelf;
                const isHorizontal = shelf?.orientation === "horizontal";
                const isVertical = shelf?.orientation === "vertical";

                return (
                  <td
                    key={`${row}-${col}`}
                    className={`w-24 h-24 text-center align-middle transition-all duration-200 ${
                      showGrid ? "border bg-white" : "border-0 bg-white"
                    }`}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, row, col)}
                  >
                    {isShelf && (
                      <label
                        draggable
                        onDragStart={(e) => onDragStart(e, shelf)}
                        className={`inline-flex justify-center items-center bg-orange-500 text-white text-xs cursor-move rounded shadow
                          ${isHorizontal ? "w-4/5 h-3/5" : "w-2/5 h-4/5"}
                        `}
                        style={{ margin: "auto" }}
                      >
                        {shelf.id}
                      </label>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}