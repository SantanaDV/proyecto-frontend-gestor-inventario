/**
 * @fileoverview Página de inicio
 * Muestra información general sobre la aplicación
 */

import HeaderFuncional from "../components/HeaderFuncional"

/**
 * Página de inicio
 * @returns {JSX.Element} Componente renderizado
 */
export default function Home() {
  return (
    <>
      <HeaderFuncional />
      <main>
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-center text-red-700">¿Qué ofrecemos?</h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Tarjeta 1 */}
              <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-lg">
                <img src="almacen.jpg" alt="Almacen" className="h-50 w-80 object-cover rounded mb-6" />
                <h3 className="text-xl font-semibold text-red-700">Gestión de Almacén</h3>
                <p className="text-center text-gray-600 mt-2">
                  Lleva el control de tu inventario de manera fácil y eficiente.
                </p>
              </div>

              {/* Tarjeta 2 */}
              <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-lg">
                <img src="inventario.jpg" alt="Inventario" className="h-50 w-80 object-cover rounded mb-6" />
                <h3 className="text-xl font-semibold text-red-700">Inventario</h3>
                <p className="text-center text-gray-600 mt-2">
                  Gestiona todos los productos de tu inventario en tiempo real.
                </p>
              </div>

              {/* Tarjeta 3 */}
              <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-lg">
                <img src="tareas.jpg" alt="Tareas" className="h-50 w-80 object-cover rounded mb-6" />
                <h3 className="text-xl font-semibold text-red-700">Tareas</h3>
                <p className="text-center text-gray-600 mt-2">
                  Organiza y realiza un seguimiento de todas las tareas pendientes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
