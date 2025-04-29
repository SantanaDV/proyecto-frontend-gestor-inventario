import React from "react";

export default function ModalAlmacen({ shelf, onClose }) {
  if (!shelf) return null;

  const rows = 12;
  const cols = 5;

  const images = [
    "caja1.png",
    "caja2.png",
    "caja3.png",
    "caja4.png",
    "caja5.png",
    "caja6.png",
    "caja7.png",
  ];

  const shelves = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () =>
      Math.random() > 0.5
        ? images[Math.floor(Math.random() * images.length)]
        : null
    )
  );

  const handleClick = (item, rowIndex, colIndex) => {
    if (item) {
      alert(
        `Has hecho click en la caja de la posición [${rowIndex + 1}, ${
          colIndex + 1
        }]`
      );
    } else {
      alert(
        `Espacio disponible en la posición [${rowIndex + 1}, ${colIndex + 1}]`
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-5xl h-auto max-h-[90vh] overflow-hidden relative">
        <h2 className="text-xl font-semibold mb-4">
          Detalles de la Estantería
        </h2>
        {/* Botón de cerrar en la esquina superior derecha */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          X
        </button>
        {/* Detalles de la estantería (ID siempre visible) */}
        <div className="mb-4">
          <label className="block text-sm font-medium">ID</label>
          <input
            type="text"
            value={shelf.id}
            readOnly
            className="border p-2 rounded w-full bg-red-200 cursor-not-allowed"
          />
        </div>
        {/* Contenedor del contenido con scroll solo en la parte inferior */}
        <div className="overflow-y-auto max-h-[60vh]">
          {/* Estantería visual (12 baldas) */}
          <div className="mt-6 space-y-2">
            {shelves.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center">
                {/* Número de la balda a la izquierda */}
                <div className="w-12 text-center font-bold">{`${
                  rowIndex + 1
                }`}</div>

                {/* Contenedor de las baldas */}
                <div className="flex justify-around border border-gray-300 p-2 rounded bg-gray-100 w-full">
                  {row.map((item, colIndex) => (
                    <div
                      key={colIndex}
                      className="w-24 h-24 flex items-center justify-center cursor-pointer"
                      onClick={() => handleClick(item, rowIndex, colIndex)}
                    >
                      {item ? (
                        <img
                          src={item}
                          alt={`Producto ${rowIndex}-${colIndex}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full border-2 border-dashed border-gray-300 rounded"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
