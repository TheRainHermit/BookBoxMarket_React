// tests/api/auth.test.js
import request from 'supertest';
import app from '../../src/server';
import { migrate, destroy } from '../../src/db';

describe('API de Autenticación', () => {
  beforeAll(async () => {
    // Configuración de la base de datos de prueba
    await migrate.latest();
  });

  afterAll(async () => {
    // Limpieza
    await destroy();
  });

  describe('POST /api/registro', () => {
    it('debería registrar un nuevo usuario', async () => {
      const userData = {
        nombre: 'Test',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/registro')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });
  });
});