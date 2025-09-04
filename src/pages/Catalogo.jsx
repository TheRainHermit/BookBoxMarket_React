import { useCart } from "../providers/CartProvider";
import React, { useState } from "react";
import cata1 from "/images/cata1.png";
import cata2 from "/images/cata2.png";
import cata3 from "/images/cata3.png";
import logo from "/images/logo.png";
import { useInventory } from "../context/InventoryContext";

const products = [
  {
    id_caja: 1,
    name: "Caja Oculta",
    desc: "Todo será completamente aleatorio",
    price: 100000,
    img: cata1,
  },
  {
    id_caja: 2,
    name: "Caja Misteriosa",
    desc: "50% de probabilidad de libros según tus preferencias",
    price: 150000,
    img: cata2,
  },
  {
    id_caja: 3,
    name: "Caja Sospechosa",
    desc: "80% de probabilidad de libros según tus preferencias",
    price: 250000,
    img: cata3,
  },
];

export default function Catalogo() {
  const { addToCart } = useCart();
  const { stock, isAdmin, updateStock, fetchStock } = useInventory();
  console.log("Stock en Catalogo:", stock)
  const [added, setAdded] = useState([false, false, false]);

  const handleAddToCart = async (p, idx) => {
    if (stock[p.id_caja] > 0) {
      await addToCart(p);
      await updateStock(p.id_caja, stock[p.id_caja] - 1);
      setAdded(prev => {
        const copy = [...prev];
        copy[idx] = true;
        return copy;
      });
      setTimeout(() => {
        setAdded(prev => {
          const copy = [...prev];
          copy[idx] = false;
          return copy;
        });
      }, 1200);
    } else {
      alert("Producto agotado");
    }
  };

  return (
    <div>
      <img src={logo} alt="Logo" />
      <h1>Catálogo</h1>
      <section className="libros">
        {products.map((p, idx) => (
          <div className={`libro${idx ? idx : ""}`} key={p.name}>
            <img src={p.img} alt={p.name} />
            <h2>{p.name}</h2>
            <p>{p.desc}</p>
            <p>Precio: ${p.price.toLocaleString()} COP</p>
            <div className="stock-status">
              <span className={`stock-badge ${stock[p.id_caja] > 0 ? 'available' : 'out-of-stock'}`}>
                {stock[p.id_caja] > 0 ? `Disponible (${stock[p.id_caja]})` : "Agotado"}
              </span>
            </div>
            <button
              className="btn-agregarcarro"
              onClick={() => handleAddToCart(p, idx)}
              disabled={stock[p.id_caja] === 0}
            >
              {stock[p.id_caja] === 0
                ? "Agotado"
                : added[idx]
                  ? "¡Añadido al Carrito!"
                  : "Agregar al Carrito"}
            </button>
          </div>
        ))}
        
      </section>

      {isAdmin && (
        <div className="filter-group">
          <button
            className="btn-admin"
            onClick={() => window.location.href = "/admin/inventario"}
          >
            Panel de Administración
          </button>
        </div>
      )}
      <br />
      <br />
      <br />
      <br />
    </div>
  );
}