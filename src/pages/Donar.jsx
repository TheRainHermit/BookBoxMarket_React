import React, { useState } from "react";
import logocontacto from "/images/logo.png";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useInsignias } from "../context/InsigniasContext";

export default function Donar() {
  const { token } = useAuth();
  const { refreshInsignias } = useInsignias();
  const [form, setForm] = useState({
    libro: "",
    mensaje: "",
  });
  const [mensaje, setMensaje] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje("");
    try {
      // 1. Registrar el libro
      const libroRes = await fetch("http://localhost:3000/api/libros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          titulo: form.libro,
          autor: "Desconocido", // Puedes pedir más datos si quieres
          genero: "Donación",
          estado: "Donado"
        })
      });
      const libroData = await libroRes.json();
      if (!libroRes.ok || !libroData.id_libro) {
        setMensaje(libroData.error || "Error al registrar el libro");
        return;
      }

      // 2. Registrar la donación
      const res = await fetch("http://localhost:3000/api/donaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          libro_id: libroData.id_libro,
          estado_donacion: "Pendiente"
        })
      });
      const data = await res.json();
      if (res.ok) {
        refreshInsignias();
        setMensaje("¡Donación registrada!");
        // Al donar:
        toast.success("¡Donación exitosa! Has ganado puntos y posiblemente una insignia.");
        toast.info("¡Gracias por tu donación! Te notificaremos por email.");
        setForm({ libro: "", mensaje: "" });
      } else {
        setMensaje(data.error || "Error al registrar la donación");
      }
    } catch {
      setMensaje("Error de conexión con el servidor");
    }
  };

  return (
    <div>
      <img className="logocontacto" src={logocontacto} alt="Logo" />
      <h1>Donación de Libros</h1>
      <form className="donar-form" onSubmit={handleSubmit}>
        <label>Libro(s) a donar:</label>
        <input
          type="text"
          name="libro"
          value={form.libro}
          onChange={handleChange}
          placeholder="Título(s) del libro"
          required
        />
        <label>Mensaje (opcional):</label>
        <textarea
          name="mensaje"
          value={form.mensaje}
          onChange={handleChange}
          placeholder="¿Algo que quieras agregar?"
        />
        <button type="submit" className="btn_mod">Enviar Donación</button>
        {mensaje && <p style={{ marginTop: 10 }}>{mensaje}</p>}
      </form>
    </div>
  );
}