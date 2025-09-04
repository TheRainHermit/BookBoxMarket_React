import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const InsigniasContext = createContext();

export function InsigniasProvider({ idUsuario, children }) {
  const [todas, setTodas] = useState([]);
  const [obtenidas, setObtenidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener todas las insignias disponibles
  const fetchTodasInsignias = useCallback(async () => {
    try {
      const response = await fetch('/api/insignias');
      if (!response.ok) throw new Error('Error al cargar las insignias');
      const data = await response.json();
      setTodas(data);
      return data;
    } catch (err) {
      console.error("Error al cargar insignias:", err);
      setError(err);
      throw err;
    }
  }, []);

  // Obtener insignias del usuario
  const fetchInsigniasUsuario = useCallback(async () => {
    if (!idUsuario) {
      setObtenidas([]);
      return [];
    }
    
    try {
      const response = await fetch(`/api/insignias/usuario?id_usuario=${idUsuario}`);
      if (!response.ok) throw new Error('Error al cargar insignias del usuario');
      const data = await response.json();
      setObtenidas(data);
      return data;
    } catch (err) {
      console.error("Error al cargar insignias del usuario:", err);
      setError(err);
      throw err;
    }
  }, [idUsuario]);

  // Cargar todos los datos necesarios
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchTodasInsignias(), fetchInsigniasUsuario()]);
    } catch (err) {
      console.error("Error al cargar datos de insignias:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchTodasInsignias, fetchInsigniasUsuario]);

  // Refrescar datos
  const refreshInsignias = useCallback(async () => {
    await cargarDatos();
  }, [cargarDatos]);

  // Cargar datos al montar y cuando cambie el idUsuario
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Verificar si hay nuevas insignias
  useEffect(() => {
    if (obtenidas.length > 0) {
      const nuevasInsignias = localStorage.getItem('nuevasInsignias');
      if (nuevasInsignias) {
        const idsNuevasInsignias = JSON.parse(nuevasInsignias);
        const insigniasDesbloqueadas = todas
          .filter(insignia => 
            idsNuevasInsignias.includes(insignia.id_insignia) && 
            !obtenidas.some(o => o.id_insignia === insignia.id_insignia)
          );
          
        if (insigniasDesbloqueadas.length > 0) {
          insigniasDesbloqueadas.forEach(insignia => {
            toast.success(`¡Nueva insignia desbloqueada: ${insignia.nombre}!`);
          });
          // Actualizar insignias obtenidas
          setObtenidas(prev => [...prev, ...insigniasDesbloqueadas]);
        }
        localStorage.removeItem('nuevasInsignias');
      }
    }
  }, [todas, obtenidas]);

  return (
    <InsigniasContext.Provider 
      value={{ 
        todas, 
        obtenidas, 
        loading, 
        error, 
        refreshInsignias 
      }}
    >
      {children}
    </InsigniasContext.Provider>
  );
}

export const useInsignias = () => {
  const context = useContext(InsigniasContext);
  if (!context) {
    throw new Error('useInsignias debe ser usado dentro de un InsigniasProvider');
  }
  return context;
};