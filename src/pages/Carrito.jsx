import React, { useState } from "react";
import { useCart } from "../providers/CartProvider";
import logocontacto from "/images/logo.png";
import { useAuth } from "../context/AuthContext";
import { useInventory } from "../context/InventoryContext";
import { toast } from "react-toastify";
import { useInsignias } from "../context/InsigniasContext";

export default function Carrito() {
  const { refreshInsignias } = useInsignias();
  const { cart, removeFromCart, clearCart } = useCart();
  const { stock, updateStock, fetchStock } = useInventory();
  const { token, user } = useAuth();
  const [fecha, setFecha] = useState("");
  const [metodo, setMetodo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar que el usuario esté autenticado
    if (!user || !user.id_usuario) {
      setMensaje("Debes iniciar sesión para realizar una compra");
      return;
    }

    setMensaje("");

    if (!fecha || !metodo) {
      setMensaje("Por favor completa todos los campos.");
      return;
    }

    // 1. Validación de stock antes de la compra
    const productos = cart.map((item, idx) => ({
      id_caja: item.id_caja,
      linia: idx + 1
      // cantidad: item.quantity || 1 // Ya no se usa
    }));

    if (productos.some(p => !p.id_caja)) {
      setMensaje("Error: Hay productos en el carrito sin identificador de caja.");
      return;
    }

    // Validación de stock (usando el carrito original)
    for (const item of cart) {
      const id = item.id_caja;
      const cantidadComprada = item.quantity || 1;
      if (stock[id] < cantidadComprada) {
        setMensaje(`Stock insuficiente para el producto con id ${id}. Quedan ${stock[id]} unidades.`);
        return;
      }
    }

    setIsLoading(true);

    try {
      // 2. Registrar la compra principal
      const compraRes = await fetch("/api/compra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          fecha_compra: fecha,
          metodo_pago: metodo
        })
      });

      const compraData = await compraRes.json();
      console.log("Respuesta compra:", compraRes.status, compraData);

      if (!compraRes.ok) {
        setMensaje(compraData.error || "Error al registrar la compra");
        setIsLoading(false);
        return;
      }

      // 3. Registrar el detalle de la compra (sin cantidad)
      const detalleRes = await fetch("/api/compra/detalle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          id_compra: compraData.id_compra,
          productos
        })
      });

      const detalleData = await detalleRes.json();
      //console.log("Respuesta detalle:", detalleRes.status, detalleData);

      if (!detalleRes.ok) {
        setMensaje(detalleData.error || "Error al registrar el detalle de la compra");
        setIsLoading(false);
        return;
      }

      // 4. Actualizar el stock de cada producto comprado
      for (const item of cart) {
        const id = item.id_caja;
        const cantidadComprada = item.quantity || 1;
        const nuevoStock = stock[id] - cantidadComprada;
        await updateStock(id, nuevoStock);
      }

      // 5. Sincronizar el stock global tras la compra
      if (typeof fetchStock === "function") {
        await fetchStock();
        //console.log("fetchStock llamado tras compra")
      }

      //refreshInsignias();
      setMensaje("¡Compra realizada con éxito!");
      // Al completar una compra:
      toast.success("¡Compra realizada! Revisa tu correo para el comprobante.");
      setShowModal(true); // <-- muestra el modal
      clearCart();
      setFecha("");
      setMetodo("");

      try {
        console.log("Verificando insignias para usuario:", user.id_usuario);
        const insigniasResponse = await fetch('/api/insignias/verificar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id_usuario: user.id_usuario })
        });
    
        const insigniasData = await insigniasResponse.json();
        console.log("Respuesta de verificación de insignias:", insigniasData);
        
        if (insigniasData.success && insigniasData.insignias && insigniasData.insignias.length > 0) {
          console.log("Nuevas insignias desbloqueadas:", insigniasData.insignias);
          toast.success(`¡Felicidades! Has desbloqueado ${insigniasData.insignias.length} nuevas insignias`);
          
          // Actualizar el contexto de insignias
          if (refreshInsignias) {
            await refreshInsignias();
            console.log("Insignias actualizadas en el contexto");
          }
        } else {
          console.log("No se otorgaron nuevas insignias");
        }
      } catch (error) {
        console.error("Error al verificar insignias:", error);
        // No mostramos error al usuario para no afectar la experiencia de compra
      }

    } catch (error) {
      console.error("Error en compra:", error);
      setMensaje("Hubo un error al procesar la compra o actualizar el stock.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="carrito-container">
      <img src={logocontacto} alt="Logo" style={{ maxWidth: 120, margin: "20px auto", display: "block" }} />
      <h1>Carrito de Compras</h1>
      <form onSubmit={handleSubmit}>
        {cart.length === 0 ? (
          <p className="carrito-vacio">¡Tu carrito está vacío!</p>
        ) : (
          <>
            <table className="carrito-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.quantity || 1}</td>
                    <td>${item.price.toLocaleString()}</td>
                    <td>${(item.price * (item.quantity || 1)).toLocaleString()}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-eliminar"
                        onClick={() => removeFromCart(item.id_caja)}
                        disabled={isLoading}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="carrito-total">
              <span>Total:</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="carrito-actions">
              <button
                type="button"
                className="btn_mod"
                onClick={clearCart}
                disabled={isLoading}
              >
                Vaciar Carrito
              </button>
              <button
                type="submit"
                className="btn-comprar"
                disabled={isLoading || cart.length === 0}
              >
                {isLoading ? "Procesando compra..." : "Comprar"}
              </button>
            </div>
            {mensaje && (
              <div className={`mensaje-feedback ${mensaje.includes("éxito") ? "exito" : "error"}`}>
                {mensaje}
              </div>
            )}
          </>
        )}
        <div style={{
          display: 'flex',
          gap: '20px',
          margin: '20px 0',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{
              marginBottom: '8px',
              fontWeight: 500,
              color: '#2c3e50'
            }}>
              Fecha de compra
            </div>
            <input
              type="date"
              id="fecha_compra"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '4px',
                border: '1px solid #ced4da',
                fontSize: '16px',
                backgroundColor: isLoading ? '#f8f9fa' : 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{
              marginBottom: '8px',
              fontWeight: 500,
              color: '#2c3e50'
            }}>
              Método de pago
            </div>
            <select
              id="metodo_pago"
              value={metodo}
              onChange={e => setMetodo(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '4px',
                border: '1px solid #ced4da',
                fontSize: '16px',
                backgroundColor: isLoading ? '#f8f9fa' : 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">Selecciona un método</option>
              <option value="credito">Tarjeta Crédito</option>
              <option value="debito">Tarjeta Débito</option>
              <option value="paypal">PayPal</option>
              <option value="pse">PSE</option>
            </select>
          </div>
        </div>
      </form>
      {/*showModal && (
        // Al completar una compra:
        toast.success("¡Compra realizada! Revisa tu correo para el comprobante.")
      )*/}
    </div>
  );
}