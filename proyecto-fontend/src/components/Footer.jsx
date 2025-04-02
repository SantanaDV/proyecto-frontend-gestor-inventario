export default function Footer() {
    return (
      <footer className="bg-red-700 text-white py-8">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Enlaces rápidos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Inicio
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Almacen
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Inventario
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
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
                  <a href="mailto:contacto@empresa.com" className="text-gray-300 hover:text-white">
                    contacto@empresa.com
                  </a>
                </li>
                <li>
                  <p className="text-gray-300">Teléfono: +1 234 567 890</p>
                </li>
              </ul>
            </div>
  
            {/* Redes Sociales */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>
  
          <div className="mt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    );
  }
  