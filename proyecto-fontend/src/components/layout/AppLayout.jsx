/**
 * @fileoverview Componente de layout principal de la aplicación
 * Incluye Navbar y Footer en todas las páginas excepto en Login
 */

import { useLocation } from "react-router-dom"
import Navbar from "../Navbar"
import Footer from "../Footer"

/**
 * Layout principal de la aplicación
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Componente renderizado
 */
function AppLayout({ children }) {
  const location = useLocation()
  const isLoginPage = location.pathname === "/"

  return (
    <>
      {!isLoginPage && <Navbar />}
      <main className="min-h-[calc(100vh-64px-200px)]">{children}</main>
      {!isLoginPage && <Footer />}
    </>
  )
}

export default AppLayout
