import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

function decodeJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    console.log("Usuario cargado de localStorage:", savedUser); // Log
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Cargar usuario/token de localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  // Guardar usuario/token en localStorage cuando cambian
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user, token]);

  // Función para hacer login
  const login = useCallback(async (email, password) => {
    console.log("Iniciando login en AuthContext con:", email);
    try {
      console.log("Iniciando login con:", email);
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
         },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      console.log("Respuesta del servidor:", response.status);
      
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error en la respuesta:", errorData); // Log del error
        throw new Error(errorData.error || 'Error en el inicio de sesión');
      }

      const data = await response.json();
      console.log("Datos de usuario recibidos:", data.user);

      setUser(data.user);
      setToken(data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  // Función para cerrar sesión
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    // Limpiar la cookie de refresh token
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }, []);

  // Refrescar token automáticamente
  useEffect(() => {
    const refreshToken = async () => {
      if (!token) return;
      
      try {
        const decoded = decodeJwt(token);
        if (!decoded || !decoded.exp) return;

        const now = Date.now() / 1000;
        const timeUntilExpiry = decoded.exp - now;

        // Si el token expira en menos de 5 minutos, lo refrescamos
        if (timeUntilExpiry < 300) {
          const response = await fetch('/api/refresh', {
            method: 'POST',
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(data.token);
          } else {
            throw new Error('Error al refrescar el token');
          }
        }
      } catch (error) {
        console.error('Error al refrescar el token:', error);
        logout();
      }
    };

    // Verificar el token cada minuto
    const interval = setInterval(refreshToken, 60000);
    // Verificar inmediatamente al montar
    refreshToken();

    return () => clearInterval(interval);
  }, [token, logout]);

  // Cerrar sesión automático si el token expira
  useEffect(() => {
    if (!token) return;
    
    const checkTokenExpiration = () => {
      const decoded = decodeJwt(token);
      if (decoded && decoded.exp) {
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          logout();
        }
      }
    };

    const interval = setInterval(checkTokenExpiration, 60000);
    checkTokenExpiration(); // Verificar inmediatamente

    return () => clearInterval(interval);
  }, [token, logout]);

  const register = useCallback(async (formData) => {
    try {
      console.log("Registrando usuario:", formData);
      const response = await fetch('/api/registro', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          password: formData.password,
          telefono: formData.telefono,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          pais: formData.pais,
          codigo_postal: formData.codigo_postal,
          fecha_nto: formData.fecha_nto ? new Date(formData.fecha_nto).toISOString() : null,
          preferencias_literarias: formData.preferencias_literarias
        }),
        credentials: 'include'
      });
  
      console.log("Respuesta del servidor:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error en el registro:", errorData);
        throw new Error(errorData.error || 'Error en el registro');
      }
  
      const data = await response.json();
      console.log("Usuario registrado:", data.user);
  
      // Iniciar sesión automáticamente después del registro
      setUser(data.user);
      setToken(data.token);
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;