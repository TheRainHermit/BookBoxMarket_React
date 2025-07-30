import { createContext, useContext, useState, useEffect } from "react";

const initialState = {
  stock: {},
  isLoading: false,
  error: null,
  isAdmin: false
};

const initialStock = {
  1: 100,
  2: 100,
  3: 100
}

export const InventoryContext = createContext();

export default function InventoryProvider({ children }) {
  const [stock, setStock] = useState(initialStock);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchStock = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/inventario/stock");
      const data = await res.json();
      setStock(data.stock || initialStock);
      console.log("Stock actualizado desde backend:" + data.stock);
      setIsLoading(false);
    } catch (err) {
      setError("Error al cargar el inventario");
      console.log("Error al obtener stock", err)
      setIsLoading(false);
    }
  };

  const updateStock = async (id, cantidad) => {
    try {
      const res = await fetch(`http://localhost:3000/api/inventario/stock/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ stock: cantidad })
      });

      if (!res.ok) throw new Error("Error al actualizar el stock")
      // Actualiza el estado local para reflejar el cambio en pantalla
      setStock(prev => ({
        ...prev,
        [id]: cantidad
      }));

    } catch (err) {
      setError("Error al actualizar el stock");

    }
  };

  const value = {
    stock,
    isLoading,
    error,
    isAdmin,
    fetchStock,
    updateStock,
    setIsAdmin
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );


}
export function useInventory() {
  return useContext(InventoryContext);
}