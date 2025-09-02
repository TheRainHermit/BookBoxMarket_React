import logo from "/images/logo.png";
import foto4 from "/images/foto4.jpg";
import foto3 from "/images/foto3.jpg";
import foto2 from "/images/foto2.jpg";

export default function QuienesSomos() {
  return (
    <div>
      <img src={logo} alt="Logo" />
      <h1>¿Quiénes Somos?</h1>
      <h2>Misión</h2>
      <p>
        Nuestra misión es fomentar el amor por la lectura de una manera sostenible y divertida. A través de nuestras cajas sorpresa, conectamos a los lectores con nuevos mundos y autores, promoviendo la diversidad literaria. Al mismo tiempo, contribuimos al cuidado del planeta al reutilizar libros donados, reduciendo la producción de papel y promoviendo una cultura de lectura más circular. Con cada caja, no solo regalamos historias, sino también la esperanza de un futuro más verde.
      </p>
      <h2>Visión</h2>
      <p>
        En 2027, utilizaremos la inteligencia artificial y el big data para ofrecer una experiencia de lectura totalmente personalizada. Nuestras cajas sorpresa se adaptarán a los gustos y preferencias de cada lector, recomendando títulos y autores que nunca antes habrían considerado. Además, integraremos realidad aumentada y otras tecnologías inmersivas para crear experiencias de lectura únicas y memorables.
      </p>
      <h1>Integrantes del Proyecto</h1>
      <section className="libros">
        <div className="libro">
          <img src={foto4} alt="Miguel Angel Fabra" />
          <p><b>Miguel Angel Fabra</b></p>
          <p>Tecnólogo en Sistemas de Información</p>
          <p>Programador Full Stack/Soporte Técnico</p>
          <p>Leader/Frontend/Backend</p>
        </div>
        <div className="libro1">
          <img src={foto3} alt="Gerson David Perez" />
          <p><b>Gerson David Perez</b></p>
          <p>Tecnólogo en Sistemas</p>
          <p>Coordinador de Infraestructura Tecnológica</p>
          <p>Frontend</p>
        </div>
        <div className="libro2">
          <img src={foto2} alt="Jhon Jairo Mosquera" />
          <p><b>Jhon Jairo Mosquera</b></p>
          <p>Tecnólogo en Sistemas</p>
          <p>Programador de Software</p>
          <p>Backend/Base de Datos</p>
        </div>
        
      </section>
    <br></br>
    <br></br>
    <br></br>
    <br></br>
    </div>

  );
}