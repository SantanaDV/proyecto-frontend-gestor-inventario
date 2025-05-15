"use client"

/**
 * @fileoverview Modal para gestionar operaciones relacionadas con el almacén.
 * Permite crear, editar y eliminar elementos del almacén.
 *
 * @component ModalAlmacen
 * @requires React
 * @requires ../utilities/apiComunicator
 * @requires ../components/ui/dialog
 * @requires ../components/ui/button
 */

/**
 * Modal para gestionar operaciones del almacén como crear o editar estanterías.
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indica si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {string} props.mode - Modo de operación ('create', 'edit', etc.)
 * @param {Object} props.currentItem - Elemento actual que se está editando (si aplica)
 * @param {Function} props.onSuccess - Función a ejecutar cuando la operación es exitosa
 * @returns {JSX.Element} Modal con formulario para gestionar elementos del almacén
 */
export default function ModalAlmacen({ shelf, onClose }) {
  // Si no hay estantería seleccionada, no renderizar nada
  if (!shelf) return null

  // Configuración de la estantería
  const rows = 12 // Número de filas (baldas)
  const cols = 5 // Número de columnas por balda

  // Imágenes de cajas para representar productos
  const images = ["caja1.png", "caja2.png", "caja3.png", "caja4.png", "caja5.png", "caja6.png", "caja7.png"]

  // Generar datos de ejemplo para las baldas
  // En una implementación real, estos datos vendrían de la API
  const shelves = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () =>
      Math.random() > 0.5 ? images[Math.floor(Math.random() * images.length)] : null,
    ),
  )

  /**
   * Maneja el clic en un elemento de la estantería
   * @param {string|null} item - Elemento seleccionado (imagen o null)
   * @param {number} rowIndex - Índice de la fila
   * @param {number} colIndex - Índice de la columna
   */
  const handleClick = (item, rowIndex, colIndex) => {
    if (item) {
      alert(`Has hecho click en la caja de la posición [${rowIndex + 1}, ${colIndex + 1}]`)
    } else {
      alert(`Espacio disponible en la posición [${rowIndex + 1}, ${colIndex + 1}]`)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-5xl h-auto max-h-[90vh] overflow-hidden relative">
        <h2 className="text-xl font-semibold mb-4">Detalles de la Estantería</h2>

        {/* Botón de cerrar en la esquina superior derecha */}
        <button onClick={onClose} className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded">
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
                <div className="w-12 text-center font-bold">{`${rowIndex + 1}`}</div>

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
                          src={item || "/placeholder.svg"}
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
  )
}