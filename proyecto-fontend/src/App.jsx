import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Almacen from "./pages/Almacen";
import Inventario from "./pages/Inventario";
import Tareas from "./pages/Tareas";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation(); 
  return (
    <>
      {/* Solo mostrar el Navbar y el Footer si la ruta no es "/": */}
      {location.pathname !== '/' && <Navbar />}  {/* Si no estamos en la página de Login */}

      <Routes>
        {/* Página principal (Login) */}
        <Route path="/" element={<Login />} />
        
        {/* Páginas después de iniciar sesión */}
        <Route path="/home" element={<Home />} />
        <Route path="/almacen" element={<Almacen />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/tareas" element={<Tareas />} />
      </Routes>

      {location.pathname !== '/' && <Footer />}  {/* Si no estamos en la página de Login */}
    </>
  );
}

export default App;
