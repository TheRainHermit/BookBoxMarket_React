import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Registro() {
  const { login } = useAuth();
  const [form, setForm] = useState(() => {
    const stored = localStorage.getItem("registroForm");
    return stored
      ? JSON.parse(stored)
      : {
          nombre: "",
          apellido: "",
          email: "",
          password: "",
          confirmpassword: "",
          telefono: "",
          direccion: "",
          ciudad: "",
          pais: "",
          codigo_postal: "",
          fecha_nto: "",
          preferencias_literarias: "",
        };
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    localStorage.setItem("registroForm", JSON.stringify(form));
  }, [form]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirmpassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          password: form.password,
          telefono: form.telefono,
          direccion: form.direccion,
          ciudad: form.ciudad,
          pais: form.pais,
          codigo_postal: form.codigo_postal,
          fecha_nto: form.fecha_nto,
          preferencias_literarias: form.preferencias_literarias,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("¡Registro exitoso! Iniciando sesión...");
        login(data); // Inicia sesión automáticamente
        localStorage.removeItem("registroForm");
        setForm({
          nombre: "",
          apellido: "",
          email: "",
          password: "",
          confirmpassword: "",
          telefono: "",
          direccion: "",
          ciudad: "",
          pais: "",
          codigo_postal: "",
          fecha_nto: "",
          preferencias_literarias: "",
        });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h1>Regístrate a BookBox Market</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nombre">Nombres: </label>
        <input
          type="text"
          name="nombre"
          className="input_usu"
          placeholder="Nombres del usuario"
          required
          value={form.nombre}
          onChange={handleChange}
        />
        <label htmlFor="apellido">Apellidos: </label>
        <input
          type="text"
          name="apellido"
          className="input_usu"
          placeholder="Apellidos del usuario"
          required
          value={form.apellido}
          onChange={handleChange}
        />
        <label htmlFor="email">E-mail: </label>
        <input
          type="email"
          name="email"
          className="input_usu"
          placeholder="Email del usuario"
          required
          value={form.email}
          onChange={handleChange}
        />
        <label htmlFor="password">Contraseña: </label>
        <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            className="pass_registro"
            name="password"
            autoComplete="current-password"
            id="id_password"
            placeholder="Contraseña del usuario"
            required
            value={form.password}
            onChange={handleChange}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            style={{
              marginLeft: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#4CAF50",
              fontSize: "1.3rem",
              display: "flex",
              alignItems: "center"
            }}
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <label htmlFor="confirmpassword">Confirmar Contraseña: </label>
        <input
          type={showPassword ? "text" : "password"}
          className="pass_confirmpassword"
          name="confirmpassword"
          autoComplete="current-password"
          id="id_confirmpassword"
          placeholder="Confirmar Contraseña del usuario"
          required
          value={form.confirmpassword}
          onChange={handleChange}
        />
        <label htmlFor="telefono">Teléfono: </label>
        <input
          type="text"
          name="telefono"
          className="input_usu"
          placeholder="Teléfono del usuario"
          required
          value={form.telefono}
          onChange={handleChange}
        />
        <label htmlFor="direccion">Dirección: </label>
        <input
          type="text"
          name="direccion"
          className="input_usu"
          placeholder="Dirección del usuario"
          required
          value={form.direccion}
          onChange={handleChange}
        />
        <label htmlFor="ciudad">Ciudad: </label>
        <input
          type="text"
          name="ciudad"
          className="input_usu"
          placeholder="Ciudad del usuario"
          required
          value={form.ciudad}
          onChange={handleChange}
        />
        <label htmlFor="pais">País: </label>
        <input
          type="text"
          name="pais"
          className="input_usu"
          placeholder="País del usuario"
          required
          value={form.pais}
          onChange={handleChange}
        />
        <label htmlFor="codigo_postal">Código Postal: </label>
        <input
          type="text"
          name="codigo_postal"
          className="input_usu"
          placeholder="Código postal del usuario"
          value={form.codigo_postal}
          onChange={handleChange}
        />
        <label htmlFor="fecha_nto">Fecha de Nacimiento:</label>
        <input
          type="date"
          name="fecha_nto"
          id="fecha_nto"
          className="input_usu"
          required
          value={form.fecha_nto}
          onChange={handleChange}
        />
        <label htmlFor="preferencias_literarias">Preferencias Literarias: </label>
        <input
          type="text"
          name="preferencias_literarias"
          className="input_usu"
          placeholder="Tus preferencias literarias"
          value={form.preferencias_literarias}
          onChange={handleChange}
        />
        <button type="submit" className="btn_mod">Registrar</button>
        <div className="spacer"></div>
        {success && <p style={{ color: "green" }}>{success}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}