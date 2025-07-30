// src/services/__tests__/auth.test.js
import {
    login,
    register,
    logout,
    getCurrentUser,
    isAuthenticated,
    authHeader
  } from '../auth';
  
  // Mock de fetch y localStorage
  global.fetch = jest.fn();
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  };
  
  // Guardar implementación original
  const originalLocalStorage = global.localStorage;
  
  beforeAll(() => {
    // Mock de localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  });
  
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });
  
  afterAll(() => {
    // Restaurar localStorage original
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage
    });
  });
  
  describe('Servicio de Autenticación', () => {
    describe('login', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
  
      it('debería hacer login exitosamente', async () => {
        const mockResponse = {
          token: 'test-token',
          user: { id: 1, email: 'test@example.com' }
        };
  
        fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
  
        const result = await login(credentials);
  
        expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
  
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
        expect(result).toEqual(mockResponse);
      });
  
      it('debería lanzar un error cuando las credenciales son inválidas', async () => {
        const errorMessage = 'Credenciales inválidas';
        fetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ message: errorMessage })
        });
  
        await expect(login(credentials)).rejects.toThrow(errorMessage);
      });
    });
  
    describe('register', () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
  
      it('debería registrar un nuevo usuario exitosamente', async () => {
        const mockResponse = {
          id: 1,
          email: 'test@example.com',
          nombre: 'Test User'
        };
  
        fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
  
        const result = await register(userData);
  
        expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
  
        expect(result).toEqual(mockResponse);
      });
  
      it('debería lanzar un error cuando el registro falla', async () => {
        const errorMessage = 'El correo ya está en uso';
        fetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ message: errorMessage })
        });
  
        await expect(register(userData)).rejects.toThrow(errorMessage);
      });
    });
  
    describe('logout', () => {
      it('debería eliminar el token del localStorage', () => {
        logout();
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      });
    });
  
    describe('getCurrentUser', () => {
      it('debería devolver null cuando no hay token', () => {
        mockLocalStorage.getItem.mockReturnValueOnce(null);
        expect(getCurrentUser()).toBeNull();
      });
  
      it('debería decodificar el token JWT correctamente', () => {
        // Token de prueba con payload: { id_usuario: 1, email: 'test@example.com' }
        const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjoxLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        
        mockLocalStorage.getItem.mockReturnValueOnce(testToken);
        
        const user = getCurrentUser();
        
        expect(user).toEqual({
          id: 1,
          email: 'test@example.com'
        });
      });
  
      it('debería devolver null si el token es inválido', () => {
        mockLocalStorage.getItem.mockReturnValueOnce('invalid.token.here');
        expect(getCurrentUser()).toBeNull();
      });
    });
  
    describe('isAuthenticated', () => {
      it('debería devolver true cuando hay un token', () => {
        mockLocalStorage.getItem.mockReturnValueOnce('test-token');
        expect(isAuthenticated()).toBe(true);
      });
  
      it('debería devolver false cuando no hay token', () => {
        mockLocalStorage.getItem.mockReturnValueOnce(null);
        expect(isAuthenticated()).toBe(false);
      });
    });
  
    describe('authHeader', () => {
      it('debería devolver el encabezado de autorización cuando hay token', () => {
        mockLocalStorage.getItem.mockReturnValueOnce('test-token');
        expect(authHeader()).toEqual({ 'Authorization': 'Bearer test-token' });
      });
  
      it('debería devolver un objeto vacío cuando no hay token', () => {
        mockLocalStorage.getItem.mockReturnValueOnce(null);
        expect(authHeader()).toEqual({});
      });
    });
  });