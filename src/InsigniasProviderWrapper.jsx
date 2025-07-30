// src/InsigniasProviderWrapper.jsx
import { useAuth } from "./context/AuthContext";
import { InsigniasProvider } from "./context/InsigniasContext";

export default function InsigniasProviderWrapper({ children }) {
  const { user } = useAuth();
  return (
    <InsigniasProvider idUsuario={user?.id_usuario}>
      {children}
    </InsigniasProvider>
  );
}