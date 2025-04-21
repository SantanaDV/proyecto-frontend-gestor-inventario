import React, { useState, useEffect } from "react";
import ModalAlmacen from "./ModalAlmacen";

export default function AlmacenVisual() {
  const [rows, setRows] = useState("");
  const [cols, setCols] = useState("");
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
        if (parsedSize?.rows && parsedSize?.cols) {
          setWarehouseSize(parsedSize);
          setRows(parsedSize.rows.toString());
          setCols(parsedSize.cols.toString());
        }
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
    const rowCount = parseInt(rows);
    const colCount = parseInt(cols);

    if (
      isNaN(rowCount) ||
      isNaN(colCount) ||
      rowCount <= 0 ||
      colCount <= 0 ||
      rowCount > 15 ||
      colCount > 15
    ) {
      setShowError(true);
      return;
    }

    setShowError(false);
    setWarehouseSize({ rows: rowCount, cols: colCount });
  };

  const addShelf = (orientation = "horizontal") => {
    if (!warehouseSize) return;

    let found = false;
    let newRow = 0;
    let newCol = 0;

    for (let row = 0; row < warehouseSize.rows; row++) {
      for (let col = 0; col < warehouseSize.cols; col++) {
        const fits =
          orientation === "horizontal"
            ? col < warehouseSize.cols
            : row < warehouseSize.rows;
        if (!fits) continue;

        const conflict = shelves.some((s) => {
          const { row: sr, col: sc } = s.position;
          const so = s.orientation;
          return so === "horizontal"
            ? sr === row && sc === col
            : sc === col && sr === row;
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
    setRows("");
    setCols("");
  };

  const openModal = (shelf) => {
    setSelectedShelf(shelf);
  };

  const closeModal = () => {
    setSelectedShelf(null);
  };

  const saveShelf = (updatedShelf) => {
    setShelves((prev) =>
      prev.map((s) => (s.id === updatedShelf.id ? updatedShelf : s))
    );
    closeModal();
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

    const orientation = shelf.orientation;
    const fitsInBounds =
      orientation === "horizontal"
        ? col < warehouseSize.cols
        : row < warehouseSize.rows;

    if (!fitsInBounds || isConflict(shelf.id, row, col, orientation)) return;

    moveShelf(shelf.id, row, col);
  };

  const isConflict = (id, newRow, newCol, orientation) => {
    return shelves.some((other) => {
      if (other.id === id) return false;
      return other.position.row === newRow && other.position.col === newCol;
    });
  };

  const toggleGrid = () => setShowGrid(!showGrid);

  if (!warehouseSize || !warehouseSize.rows || !warehouseSize.cols) {
    return (
      <form onSubmit={handleGridSubmit} className="p-4">
        <label className="block mb-2">
          Número de Filas:
          <input
            type="number"
            value={rows}
            onChange={(e) => setRows(e.target.value)}
            className="border mx-2 p-1"
            required
            max={15}
            min={1}
          />
        </label>
        <label className="block mb-2">
          Número de Columnas:
          <input
            type="number"
            value={cols}
            onChange={(e) => setCols(e.target.value)}
            className="border mx-2 p-1"
            required
            max={15}
            min={1}
          />
        </label>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2">
          Crear Almacén
        </button>
        {showError && (
          <p className="text-red-500 mt-2">
            Por favor, ingresa números válidos (máximo 15) para filas y columnas.
          </p>
        )}
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

      {selectedShelf && (
        <ModalAlmacen
          shelf={selectedShelf}
          onClose={closeModal}
          onSave={saveShelf}
        />
      )}

      <div className="overflow-x-auto bg-gray-50">
        <table className="border-collapse w-full min-w-max table-fixed">
          <tbody>
            {[...Array(warehouseSize.rows)].map((_, row) => (
              <tr key={row}>
                {[...Array(warehouseSize.cols)].map((_, col) => {
                  const shelf = shelves.find(
                    (s) => s.position.row === row && s.position.col === col
                  );

                  const isShelf = !!shelf;
                  const isHorizontal = shelf?.orientation === "horizontal";

                  return (
                    <td
                      key={`${row}-${col}`}
                      className={`w-24 h-24 text-center align-middle ${
                        showGrid ? "border" : "border-0"
                      } bg-gray-50`}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, row, col)}
                    >
                      {isShelf && (
                        <div
                          className={`inline-block bg-orange-500 text-white text-xs cursor-pointer rounded shadow
                            ${isHorizontal ? "w-4/5 h-3/5" : "w-2/5 h-4/5"}`}
                          style={{ margin: "auto", padding: "5px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(shelf);
                          }}
                          draggable
                          onDragStart={(e) => onDragStart(e, shelf)}
                        >
                          {shelf.id}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
