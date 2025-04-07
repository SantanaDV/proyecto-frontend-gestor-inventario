import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Almacen from "./pages/Almacen"; 
import Estanteria from "./components/Estanteria";
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
      {location.pathname !== '/' && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/almacen" element={<Almacen />} />
        <Route path="/estanteria/:id" element={<Estanteria />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/tareas" element={<Tareas />} />
      </Routes>

      {location.pathname !== '/' && <Footer />}
    </>
  );
}

export default App;