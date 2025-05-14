/**
 * @fileoverview Componente principal de la aplicación
 * Configura las rutas y el contexto de autenticación
 */

import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import AppLayout from "./components/layout/AppLayout"
import ProtectedRoute from "./components/layout/ProtectedRoute"

// Páginas
import Home from "./pages/Home"
import Login from "./pages/Login"
import Almacen from "./pages/Almacen"
import Estanteria from "./components/Estanteria"
import Inventario from "./pages/Inventario"
import Tareas from "./pages/Tareas"
import CalendarioTareas from "./pages/Calendar"
import LogoutButton from "./utilities/auth"

/**
 * Componente principal de la aplicación
 * @returns {JSX.Element} Componente renderizado
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              path="/almacen"
              element={
                <ProtectedRoute>
                  <Almacen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/estanteria/:id"
              element={
                <ProtectedRoute>
                  <Estanteria />
                </ProtectedRoute>
              }
            />

            <Route
              path="/inventario"
              element={
                <ProtectedRoute>
                  <Inventario />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tareas"
              element={
                <ProtectedRoute>
                  <Tareas />
                </ProtectedRoute>
              }
            />

            <Route
              path="/calendario"
              element={
                <ProtectedRoute>
                  <CalendarioTareas />
                </ProtectedRoute>
              }
            />

            <Route
              path="/logout"
              element={
                <ProtectedRoute>
                  <LogoutButton />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </Router>
  )
}

export default App
