import React, { useEffect } from "react";
import { useInsignias } from "../context/InsigniasContext";
import { toast } from "react-toastify";

const InsigniasUsuario = () => {
  const { todas, obtenidas, loading, error } = useInsignias();

  // Mostrar notificaciones de nuevas insignias
  useEffect(() => {
    const nuevasInsignias = localStorage.getItem('nuevasInsignias');
    if (nuevasInsignias && obtenidas.length > 0) {
      const idsNuevasInsignias = JSON.parse(nuevasInsignias);
      const nuevas = todas.filter(insignia => 
        idsNuevasInsignias.includes(insignia.id_insignia)
      );
      
      nuevas.forEach(insignia => {
        toast.success(`¡Nueva insignia desbloqueada: ${insignia.nombre}!`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
      
      // Limpiar después de mostrar las notificaciones
      localStorage.removeItem('nuevasInsignias');
    }
  }, [obtenidas, todas]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error al cargar las insignias: {error.message}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mis Logros</h2>
      {todas.length === 0 ? (
        <p className="text-gray-600">No hay insignias disponibles.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {todas.map((insignia) => {
            const obtenida = obtenidas.some(i => i.id_insignia === insignia.id_insignia);
            
            return (
              <div
                key={insignia.id_insignia}
                className={`flex flex-col items-center p-4 rounded-lg transition-all duration-300 ${
                  obtenida
                    ? "bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 transform hover:scale-105"
                    : "bg-gray-50 border-2 border-gray-200 opacity-70"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-2 ${
                    obtenida ? "text-yellow-500" : "text-gray-400"
                  }`}
                >
                  {obtenida ? "🏆" : "🔒"}
                </div>
                <h3
                  className={`text-center font-semibold ${
                    obtenida ? "text-blue-800" : "text-gray-600"
                  }`}
                >
                  {insignia.nombre}
                </h3>
                {obtenida && (
                  <p className="text-xs text-gray-600 text-center mt-1">
                    {insignia.descripcion}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InsigniasUsuario;