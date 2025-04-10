import React, { useState, useEffect } from "react";

export default function AlmacenVisual() {
  const [gridSize, setGridSize] = useState("");
  const [warehouseSize, setWarehouseSize] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [showError, setShowError] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedShelf, setSelectedShelf] = useState(null);

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
            ? col < warehouseSize.gridCount
            : row < warehouseSize.gridCount;

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

  const openModal = (shelf) => {
    setSelectedShelf(shelf);
  };

  const closeModal = () => {
    setSelectedShelf(null);
  };

  const onDragStart = (e, shelf) => {
    e.dataTransfer.setData("shelfId", shelf.id);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const isConflict = (id, newRow, newCol, orientation) => {
    return shelves.some((other) => {
      if (other.id === id) return false;

      const or = other.position.row;
      const oc = other.position.col;
      const oo = other.orientation;

      const occupiedCells = [];
      if (oo === "horizontal") {
        occupiedCells.push([or, oc], [or, oc]); // Horizontal ocupa la columna y la siguiente
      } else {
        occupiedCells.push([or, oc], [or , oc]); // Vertical ocupa la fila y la siguiente
      }

      const newCells = [];
      if (orientation === "horizontal") {
        newCells.push([newRow, newCol], [newRow, newCol]); // Horizontal ocupa la columna y la siguiente
      } else {
        newCells.push([newRow, newCol], [newRow, newCol]); // Vertical ocupa la fila y la siguiente
      }

      // Verificar conflictos
      return newCells.some(([r, c]) =>
        occupiedCells.some(([or, oc]) => or === r && oc === c)
      );
    });
  };

  const onDrop = (e, row, col) => {
    e.preventDefault();
    const shelfId = e.dataTransfer.getData("shelfId");
    const shelf = shelves.find((s) => s.id === shelfId);
    if (!shelf) return;

    const orientation = shelf.orientation;

    // Revisar si hay suficiente espacio para la estantería
    const fitsInBounds =
      orientation === "horizontal"
        ? col + 1 < warehouseSize.gridCount+1 // Solo revisamos dos columnas (col y col+1)
        : row + 1 < warehouseSize.gridCount;

    if (!fitsInBounds) return;

    // Comprobamos si hay conflictos con otras estanterías
    if (isConflict(shelf.id, row, col, orientation)) return;

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

      {/* Modal */}
      {selectedShelf && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">Detalles de la Estantería</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium">ID</label>
              <input
                type="text"
                value={selectedShelf.id}
                readOnly
                className="border p-2 rounded w-full bg-red-200 cursor-not-allowed"
              />
            </div>
            {/* Aquí puedes añadir más campos, como los que mencionaste en tu modal */}
            <button
              onClick={closeModal}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

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
                      <button
                        onClick={() => openModal(shelf)}
                        className={`inline-flex justify-center items-center bg-orange-500 text-white text-xs cursor-pointer rounded shadow
                          ${isHorizontal ? "w-4/5 h-3/5" : "w-2/5 h-4/5"}`}
                        style={{ margin: "auto" }}
                      >
                        {shelf.id}
                      </button>
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
