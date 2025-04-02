export default function Body() {
    return (
      <main>
        {/* Sección de bienvenida */}
        <section className="bg-red-700 text-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold sm:text-5xl">
                Bienvenido a nuestro sitio web
              </h1>
              <p className="mt-4 text-lg text-gray-300">
                Aquí encontrarás todo lo que necesitas para gestionar tu negocio de manera eficiente.
              </p>
              <a
                href="#"
                className="mt-8 inline-block rounded-lg bg-white py-3 px-6 text-lg font-semibold text-red-700 hover:bg-gray-200"
              >
                Empezar ahora
              </a>
            </div>
          </div>
        </section>
  
        {/* Sección de contenido */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-center text-red-700">
              ¿Qué ofrecemos?
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Tarjeta 1 */}
              <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-lg">
                <img
                  src="https://via.placeholder.com/150"
                  alt="Almacen"
                  className="h-32 w-32 object-cover rounded-full mb-6"
                />
                <h3 className="text-xl font-semibold text-red-700">Gestión de Almacén</h3>
                <p className="text-center text-gray-600 mt-2">
                  Lleva el control de tu inventario de manera fácil y eficiente.
                </p>
              </div>
  
              {/* Tarjeta 2 */}
              <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-lg">
                <img
                  src="https://via.placeholder.com/150"
                  alt="Inventario"
                  className="h-32 w-32 object-cover rounded-full mb-6"
                />
                <h3 className="text-xl font-semibold text-red-700">Inventario</h3>
                <p className="text-center text-gray-600 mt-2">
                  Gestiona todos los productos de tu inventario en tiempo real.
                </p>
              </div>
  
              {/* Tarjeta 3 */}
              <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-lg">
                <img
                  src="https://via.placeholder.com/150"
                  alt="Tareas"
                  className="h-32 w-32 object-cover rounded-full mb-6"
                />
                <h3 className="text-xl font-semibold text-red-700">Tareas</h3>
                <p className="text-center text-gray-600 mt-2">
                  Organiza y realiza un seguimiento de todas las tareas pendientes.
                </p>
              </div>
            </div>
          </div>
        </section>
  
        {/* Sección adicional */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-red-700">
                ¿Listo para comenzar?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Únete a nosotros hoy y comienza a organizar tu negocio de manera más eficiente.
              </p>
              <a
                href="#"
                className="mt-8 inline-block rounded-lg bg-red-700 py-3 px-6 text-lg font-semibold text-white hover:bg-red-800"
              >
                Regístrate
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }
  