// src/components/__tests__/AuthModal.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthModal from '../AuthModal';
import { AuthProvider } from '../../providers/AuthProvider';

// Mock de las funciones de autenticación
jest.mock('../../services/auth', () => ({
  login: jest.fn(),
  register: jest.fn(),
}));

const renderAuthModal = (props = {}) => {
  return render(
    <AuthProvider>
      <AuthModal isOpen={true} onClose={jest.fn()} {...props} />
    </AuthProvider>
  );
};

describe('AuthModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería mostrar el formulario de inicio de sesión por defecto', () => {
    renderAuthModal();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('debería cambiar al formulario de registro', () => {
    renderAuthModal();
    fireEvent.click(screen.getByText(/registrarse/i));
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('debería mostrar errores de validación en el formulario de inicio de sesión', async () => {
    renderAuthModal();
    
    // Intentar enviar el formulario vacío
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    // Verificar mensajes de error
    expect(await screen.findByText(/el correo es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
  });

  it('debería permitir el inicio de sesión exitoso', async () => {
    const mockOnSuccess = jest.fn();
    const { login } = require('../../services/auth');
    login.mockResolvedValueOnce({ user: { id: 1, email: 'test@example.com' } });

    renderAuthModal({ onSuccess: mockOnSuccess });
    
    // Rellenar el formulario
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123');
    
    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    // Verificar que se llamó a la función de login con los datos correctos
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});