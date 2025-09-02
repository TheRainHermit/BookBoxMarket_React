// src/services/auth.js
const API_URL = '/api';

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en el inicio de sesión');
    }

    const data = await response.json();
    // Guardar token en localStorage
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en el registro');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    // Decodificar el token JWT (sin verificar la firma)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    return {
      id: payload.id_usuario,
      email: payload.email,
      // Agregar más campos según sea necesario
    };
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};