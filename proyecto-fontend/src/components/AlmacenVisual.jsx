import React, { useState, useEffect } from "react";

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

    console.log("Datos guardados en localStorage:");
    console.log("warehouseSize:", savedSize);
    console.log("shelves:", savedShelves);

    if (savedSize) {
      try {
        const parsedSize = JSON.parse(savedSize);
        if (parsedSize && parsedSize.rows && parsedSize.cols) {
          setWarehouseSize(parsedSize); // Guardamos el tamaño del almacén
          setRows(parsedSize.rows.toString()); // Establecemos el número de filas
          setCols(parsedSize.cols.toString()); // Establecemos el número de columnas
        }
      } catch (error) {
        console.error("Error al parsear warehouseSize", error);
      }
    }

    setShelves(savedShelves); // Establecemos las estanterías
  }, []); // Este useEffect se ejecutará solo una vez al principio

  useEffect(() => {
    console.log("Guardando warehouseSize:", warehouseSize);
    if (warehouseSize) {
      localStorage.setItem("warehouseSize", JSON.stringify(warehouseSize));
    }
  }, [warehouseSize]); // Guardamos warehouseSize cuando cambia

  useEffect(() => {
    console.log("Guardando shelves:", shelves);
    if (shelves.length > 0) {
      localStorage.setItem("shelves", JSON.stringify(shelves));
    }
  }, [shelves]); // Guardamos shelves cuando cambia

  const handleGridSubmit = (e) => {
    e.preventDefault();
    const rowCount = parseInt(rows);
    const colCount = parseInt(cols);

    if (isNaN(rowCount) || rowCount <= 0 || isNaN(colCount) || colCount <= 0) {
      if(rowCount <=30 && colCount <=30){
        setShowError(true);
        return;
      }

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
    setRows("");
    setCols("");
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

  const onDrop = (e, row, col) => {
    e.preventDefault();
    const shelfId = e.dataTransfer.getData("shelfId");
    const shelf = shelves.find((s) => s.id === shelfId);
    if (!shelf) return;

    const orientation = shelf.orientation;

    // Revisar si hay suficiente espacio para la estantería
    const fitsInBounds =
      orientation === "horizontal"
        ? col < warehouseSize.cols // Horizontal ocupa solo una celda
        : row < warehouseSize.rows; // Vertical ocupa solo una celda

    if (!fitsInBounds) {
      console.log(`La estantería no cabe en los límites de la cuadrícula: ${orientation} en ${row}, ${col}`);
      return;
    }

    // Comprobamos si hay conflictos con otras estanterías
    if (isConflict(shelf.id, row, col, orientation)) {
      console.log(`Conflicto al mover la estantería ${shelf.id} a la casilla ${row}, ${col}`);
      return;
    }

    moveShelf(shelf.id, row, col);
  };

  const isConflict = (id, newRow, newCol, orientation) => {
    return shelves.some((other) => {
      if (other.id === id) return false;

      const or = other.position.row;
      const oc = other.position.col;
      const oo = other.orientation;

      const occupiedCells = [];
      if (oo === "horizontal") {
        occupiedCells.push([or, oc]); // Horizontal ocupa solo una celda
      } else {
        occupiedCells.push([or, oc]); // Vertical ocupa solo una celda
      }

      const newCells = [];
      if (orientation === "horizontal") {
        newCells.push([newRow, newCol]); // Horizontal ocupa solo una celda
      } else {
        newCells.push([newRow, newCol]); // Vertical ocupa solo una celda
      }

      // Verificar conflictos
      const conflictFound = newCells.some(([r, c]) =>
        occupiedCells.some(([or, oc]) => or === r && oc === c)
      );

      if (conflictFound) {
        console.log(`Conflicto: Estantería de ID ${id} intenta ocupar la misma celda que la estantería de ID ${other.id} en [${newRow}, ${newCol}]`);
      }

      return conflictFound;
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
          />
        </label>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2">
          Crear Almacén
        </button>
        {showError && (
          <p className="text-red-500 mt-2">
            Por favor, ingresa números válidos para filas y columnas.
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
          {[...Array(warehouseSize.rows)].map((_, row) => (
            <tr key={row}>
              {[...Array(warehouseSize.cols)].map((_, col) => {
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
                      <div
                        className={`inline-block justify-center items-center bg-orange-500 text-white text-xs cursor-pointer rounded shadow
                          ${isHorizontal ? "w-4/5 h-3/5" : "w-2/5 h-4/5"}`}
                        style={{ margin: "auto", padding: "5px" }} // Margin interior añadido
                        onClick={(e) => {
                          e.stopPropagation(); // Evita que el click en el contenedor dispare el onClick del td
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
  );
}
