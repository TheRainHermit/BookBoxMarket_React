// Nuevo componente de registro
import React, { useState } from "react";
import axios from "axios";

export default function RegisterModal({ show, onClose }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!show) return null;

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("http://localhost:3000/api/register", form);
      setSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.");
      setForm({ email: "", password: "" });
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Error de servidor.");
    }
  };

  return (
    <div className="modal" style={{ display: "block" }}>
      <form className="modal-content animate" onSubmit={handleSubmit}>
        <div className="container">
          <label><b>Correo: </b></label>
          <input
            type="text"
            name="email"
            placeholder="Ingresa tu correo"
            required
            value={form.email}
            onChange={handleChange}
          />
          <br /><br />
          <label><b>Contraseña</b></label>
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            value={form.password}
            onChange={handleChange}
          />
          <br /><br />
          <button type="submit">Registrarse</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}
        </div>
        <div className="container" style={{ backgroundColor: "#f1f1f1" }}>
          <button type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}