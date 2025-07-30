// src/components/__tests__/Navbar.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from '../Navbar';
import { AuthProvider } from '../../providers/AuthProvider';

const renderNavbar = (isAuthenticated = false) => {
  return render(
    <Router>
      <AuthProvider value={{ isAuthenticated, user: isAuthenticated ? { name: 'Test User' } : null }}>
        <Navbar />
      </AuthProvider>
    </Router>
  );
};

describe('Navbar', () => {
  it('debería mostrar los enlaces de navegación', () => {
    renderNavbar();
    
    expect(screen.getByText(/inicio/i)).toBeInTheDocument();
    expect(screen.getByText(/catálogo/i)).toBeInTheDocument();
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
  });

  it('debería mostrar el menú de usuario cuando está autenticado', () => {
    renderNavbar(true);
    
    expect(screen.getByText(/test user/i)).toBeInTheDocument();
    expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument();
    expect(screen.queryByText(/iniciar sesión/i)).not.toBeInTheDocument();
  });

  it('debería abrir el modal de autenticación al hacer clic en Iniciar sesión', () => {
    const setShowAuthModal = jest.fn();
    jest.spyOn(React, 'useState').mockImplementation(() => [false, setShowAuthModal]);
    
    renderNavbar();
    
    fireEvent.click(screen.getByText(/iniciar sesión/i));
    expect(setShowAuthModal).toHaveBeenCalledWith(true);
  });
});