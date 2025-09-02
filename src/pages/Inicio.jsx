import Slider from "../components/Slider";
import logo from "/images/logo.png";

export default function Inicio() {
  return (
    <div>
      <img src={logo} alt="Logo" />
      <p>¿Quieres leer? ¡Pues abre una caja!</p>
      <Slider />
    </div>
  );
}