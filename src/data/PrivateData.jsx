// Nuevo componente para consumir una ruta privada
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Importa el hook

export default function PrivateData() {
  const { token } = useAuth(); // Obtén el token del contexto
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getPrivateData = async () => {
    setError("");
    try {
      const res = await axios.get("/api/private", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Error de servidor");
    }
  };

  return (
    <div>
      <button onClick={getPrivateData}>Ver datos privados</button>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}