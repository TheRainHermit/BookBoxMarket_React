// src/components/__tests__/Carrito.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider } from '../../providers/CartProvider';
import Carrito from '../Carrito';

const mockItems = [
  {
    id: 1,
    nombre: 'Libro de Prueba',
    precio: 19.99,
    cantidad: 2,
    imagen: 'test.jpg'
  }
];

const renderCarrito = (items = []) => {
  return render(
    <CartProvider value={{ items, removeFromCart: jest.fn(), updateQuantity: jest.fn() }}>
      <Carrito isOpen={true} onClose={jest.fn()} />
    </CartProvider>
  );
};

describe('Carrito', () => {
  it('debería mostrar el carrito vacío cuando no hay productos', () => {
    renderCarrito();
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
  });

  it('debería mostrar los productos del carrito', () => {
    renderCarrito(mockItems);
    
    expect(screen.getByText(/libro de prueba/i)).toBeInTheDocument();
    expect(screen.getByText(/\$19.99/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('debería permitir actualizar la cantidad de un producto', () => {
    const updateQuantity = jest.fn();
    render(
      <CartProvider value={{ items: mockItems, updateQuantity, removeFromCart: jest.fn() }}>
        <Carrito isOpen={true} onClose={jest.fn()} />
      </CartProvider>
    );
    
    const input = screen.getByDisplayValue('2');
    fireEvent.change(input, { target: { value: '3' } });
    
    expect(updateQuantity).toHaveBeenCalledWith(1, 3);
  });

  it('debería permitir eliminar un producto del carrito', () => {
    const removeFromCart = jest.fn();
    render(
      <CartProvider value={{ items: mockItems, removeFromCart, updateQuantity: jest.fn() }}>
        <Carrito isOpen={true} onClose={jest.fn()} />
      </CartProvider>
    );
    
    fireEvent.click(screen.getByLabelText(/eliminar/i));
    expect(removeFromCart).toHaveBeenCalledWith(1);
  });
});