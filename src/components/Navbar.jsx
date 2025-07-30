import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import logoinicio from "../assets/images/logoinicio.png";
import userImg from "../assets/images/user.png";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onLoginClick }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logoinicio} alt="Inicio" />
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/quienes-somos" className={location.pathname === "/quienes-somos" ? "active" : ""}>
          Quiénes Somos
        </Link>
        <Link to="/catalogo" className={location.pathname === "/catalogo" ? "active" : ""}>
          Catálogo
        </Link>
        <Link to="/contacto" className={location.pathname === "/contacto" ? "active" : ""}>
          Contacto
        </Link>
        <Link to="/carrito" className={location.pathname === "/carrito" ? "active" : ""}>
          Carrito de Compra
        </Link>
        <Link to="/donar" className={location.pathname === "/donar" ? "active" : ""}>
          Donar Libros
        </Link>
      </div>
      <div className="navbar-actions">
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link to="/perfil" className="navbar-link">
              <img src={userImg} className="imagenlogin" alt="Perfil" style={{ height: 24, verticalAlign: "middle" }} />
              <span>¡Hola, {user.nombre}!</span>
            </Link>
            <button className="navbar-btn" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button className="navbar-btn" onClick={onLoginClick}>
            <img src={userImg} className="imagenlogin" alt="Login" style={{ height: 24, verticalAlign: "middle" }} />
            &nbsp;Iniciar sesión
          </button>
        )}
      </div>
    </nav>
  );
}