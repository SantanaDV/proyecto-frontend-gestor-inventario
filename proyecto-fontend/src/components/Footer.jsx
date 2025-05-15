/**
 * @fileoverview Componente de pie de página
 * Muestra información de contacto y enlaces rápidos
 */

/**
 * Componente de pie de página
 * @returns {JSX.Element} Componente renderizado
 */
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-red-700 text-white py-8">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="/home" className="text-gray-300 hover:text-white transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/almacen" className="text-gray-300 hover:text-white transition-colors">
                  Almacen
                </a>
              </li>
              <li>
                <a href="/inventario" className="text-gray-300 hover:text-white transition-colors">
                  Inventario
                </a>
              </li>
              <li>
                <a href="/tareas" className="text-gray-300 hover:text-white transition-colors">
                  Tareas
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:contacto@qualicard.com" className="text-gray-300 hover:text-white transition-colors">
                  contacto@qualicard.com
                </a>
              </li>
              <li>
                <p className="text-gray-300">Teléfono: +34 612 345 678</p>
              </li>
            </ul>
          </div>

          {/* Redes Sociales */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram h-6 w-6"></i>
              </a>

              <a
                href="https://www.facebook.com"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f h-6 w-6"></i>
              </a>

              <a
                href="https://x.com"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <i className="fab fa-x h-6 w-6"></i>
              </a>

              <a
                href="https://www.linkedin.com"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin h-6 w-6"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Qualica-RD. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
