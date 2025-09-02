import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function CambiarContraseña() {
  const { token, setUser } = useAuth();
  const [mensaje, setMensaje] = useState("");
  const [errores, setErrores] = useState({});
  const [cambiarPass, setCambiarPass] = useState({
    password_actual: "",
    password_nueva: "",
    password_confirmacion: ""
  });

  const handleChange = e => {
    setCambiarPass({ ...cambiarPass, [e.target.name]: e.target.value });
  };

  const validarFormulario = () => {
    const errores = {};

    if (!cambiarPass.password_actual.trim()) {
      errores.password_actual = "La contraseña actual es requerida";
    }

    if (!cambiarPass.password_nueva.trim()) {
      errores.password_nueva = "La nueva contraseña es requerida";
    } else if (cambiarPass.password_nueva.length < 8) {
      errores.password_nueva = "La nueva contraseña debe tener al menos 8 caracteres";
    }

    if (!cambiarPass.password_confirmacion.trim()) {
      errores.password_confirmacion = "La confirmación de contraseña es requerida";
    } else if (cambiarPass.password_nueva !== cambiarPass.password_confirmacion) {
      errores.password_confirmacion = "Las contraseñas no coinciden";
    }

    setErrores(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validarFormulario()) return;

    try {
      const res = await fetch("/api/usuario/contraseña", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(cambiarPass)
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje("Contraseña cambiada exitosamente");
        setUser(null); // Forzar reautenticación
      } else {
        setMensaje(data.error || "Error al cambiar la contraseña");
      }
    } catch (error) {
      setMensaje("Error de conexión al cambiar la contraseña");
    }
  };

  return (
    <div className="cambiar-contraseña">
      <h2>Cambiar Contraseña</h2>
      {mensaje && (
        <div className={`mensaje ${mensaje.includes("Error") ? "error" : "success"}`}>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-cambiar-contraseña">
        <div className="form-group">
          <label htmlFor="password_actual">Contraseña actual:</label>
          <input
            type="password"
            id="password_actual"
            name="password_actual"
            value={cambiarPass.password_actual}
            onChange={handleChange}
            className={errores.password_actual ? "error-input" : ""}
            required
          />
          {errores.password_actual && (
            <p className="error-message">{errores.password_actual}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password_nueva">Nueva contraseña:</label>
          <input
            type="password"
            id="password_nueva"
            name="password_nueva"
            value={cambiarPass.password_nueva}
            onChange={handleChange}
            className={errores.password_nueva ? "error-input" : ""}
            required
          />
          {errores.password_nueva && (
            <p className="error-message">{errores.password_nueva}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password_confirmacion">Confirmar nueva contraseña:</label>
          <input
            type="password"
            id="password_confirmacion"
            name="password_confirmacion"
            value={cambiarPass.password_confirmacion}
            onChange={handleChange}
            className={errores.password_confirmacion ? "error-input" : ""}
            required
          />
          {errores.password_confirmacion && (
            <p className="error-message">{errores.password_confirmacion}</p>
          )}
        </div>

        <button type="submit" className="btn_mod btn-primary">
          Cambiar contraseña
        </button>
      </form>
    </div>
  );
}
