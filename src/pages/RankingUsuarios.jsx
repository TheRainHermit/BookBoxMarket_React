import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const RankingUsuarios = () => {
  const [ranking, setRanking] = useState([]);
  const [posicionUsuario, setPosicionUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch('/api/usuarios/ranking', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar el ranking');
        }
        
        const data = await response.json();
        setRanking(data.ranking || []);
        setPosicionUsuario(data.posicionUsuarioActual);
      } catch (err) {
        console.error('Error al cargar ranking:', err);
        setError('No se pudo cargar el ranking. Intenta recargar la página.');
        toast.error('Error al cargar el ranking');
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

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
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Ranking de Usuarios</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posición
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puntos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ranking.map((usuario, index) => (
              <tr 
                key={usuario.id} 
                className={`hover:bg-gray-50 ${
                  usuario.esActual ? 'bg-blue-50 font-medium' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 mr-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-lg">
                            {usuario.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>         
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {usuario.nombre}
                        {usuario.esActual && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {usuario.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {usuario.puntos.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Nivel {usuario.nivel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {posicionUsuario && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Tu posición actual: <span className="font-medium">#{posicionUsuario}</span>
        </div>
      )}
    </div>
  );
};

export default RankingUsuarios;