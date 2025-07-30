import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Inicio from "./pages/Inicio";
import QuienesSomos from "./pages/Quienessomos";
import Catalogo from "./pages/Catalogo";
import Carrito from "./pages/Carrito";
import Donar from "./pages/Donar";
import Contacto from "./pages/Contacto";
import AuthModal from "./components/AuthModal";
import Registro from "./pages/Registro";
import PerfilUsuario from "./pages/PerfilUsuario";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Footer from "./components/Footer";
import "./styles.css";
import { ToastContainer } from 'react-toastify';


function App() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <Router>
      <Navbar onLoginClick={() => handleOpenAuthModal('login')} />
      <main>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/donar" element={<Donar />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/perfil" element={<PerfilUsuario />} />
        </Routes>
        <Footer />
      </main>
      <AuthModal 
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </Router>
  );
}

export default App;