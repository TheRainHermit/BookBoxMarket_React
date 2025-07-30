// tests/auth.test.js
const { hashPassword, comparePassword } = require('../src/utils/auth');

describe('Autenticación', () => {
  test('debería hashear correctamente una contraseña', async () => {
    const password = 'miContraseñaSegura';
    const hashed = await hashPassword(password);
    expect(hashed).not.toBe(password);
    expect(hashed.length).toBeGreaterThan(0);
  });

  test('debería verificar correctamente una contraseña', async () => {
    const password = 'miContraseñaSegura';
    const hashed = await hashPassword(password);
    const isValid = await comparePassword(password, hashed);
    expect(isValid).toBe(true);
  });
});