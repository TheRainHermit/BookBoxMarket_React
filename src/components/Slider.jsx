import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Slider.css";
import caja from "../assets/images/caja.jpeg";
import caja1 from "../assets/images/caja1.jpeg";
import caja2 from "../assets/images/caja2.jpeg";

const slides = [
  { src: caja, alt: "Caja 1" },
  { src: caja1, alt: "Caja 2" },
  { src: caja2, alt: "Caja 3" },
];

export default function Slider() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (idx) => setCurrent(idx);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [current]);

  return (
    <div className="slider-container">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={slides[current].src}
          alt={slides[current].alt}
          className="slider-image"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.7 }}
        />
      </AnimatePresence>
      <button className="slider-arrow left" onClick={prevSlide} aria-label="Anterior">
        &#10094;
      </button>
      <button className="slider-arrow right" onClick={nextSlide} aria-label="Siguiente">
        &#10095;
      </button>
      <br></br>
      <div className="slider-dots">
        
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={`slider-dot${current === idx ? " active" : ""}`}
            onClick={() => goToSlide(idx)}
            aria-label={`Ir a la imagen ${idx + 1}`}
          ></span>
        ))}
      </div>
    </div>
  );
}