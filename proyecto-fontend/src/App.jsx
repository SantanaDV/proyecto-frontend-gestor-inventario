import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Asegúrate de importar Router y Routes
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Almacen from "./pages/Almacen";
import Inventario from "./pages/Inventario";
import Tareas from "./pages/Tareas";

function App() {
  return (
    <Router>
      <Navbar /> 
      
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/almacen" element={<Almacen />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/tareas" element={<Tareas />} />
        <Route path="/" element={<Home />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
