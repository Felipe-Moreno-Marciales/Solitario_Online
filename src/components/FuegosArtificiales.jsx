import React, { useEffect, useRef } from "react";

const CONFIG_POR_DEFECTO = {
  duracionMs: 7000,
  intervaloLanzamientoMs: 280,
  particulasPorExplosion: 38,
  gravedad: 0.05,
  friccion: 0.985,
};

const PALETA = ["#f43f5e", "#fb7185", "#f59e0b", "#fde047", "#22c55e", "#2dd4bf", "#38bdf8", "#818cf8", "#c084fc"];

function colorAleatorio() {
  return PALETA[Math.floor(Math.random() * PALETA.length)];
}

function crearParticulas(x, y, cantidad) {
  return Array.from({ length: cantidad }, () => {
    const angulo = Math.random() * Math.PI * 2;
    const velocidad = 1.8 + Math.random() * 3.8;

    return {
      x,
      y,
      vx: Math.cos(angulo) * velocidad,
      vy: Math.sin(angulo) * velocidad,
      vida: 1,
      decaimiento: 0.011 + Math.random() * 0.02,
      tamano: 1.8 + Math.random() * 2.2,
      color: colorAleatorio(),
    };
  });
}

export default function FuegosArtificiales({ activo, configuracion = CONFIG_POR_DEFECTO }) {
  const referenciaCanvas = useRef(null);

  useEffect(() => {
    if (!activo) return;

    const canvas = referenciaCanvas.current;
    if (!canvas) return;

    const contexto = canvas.getContext("2d");
    if (!contexto) return;

    let idAnimacion = 0;
    let tiempoUltimo = 0;
    let ultimaExplosion = 0;
    let particulas = [];

    const configuracionFinal = { ...CONFIG_POR_DEFECTO, ...configuracion };
    const tiempoFin = performance.now() + configuracionFinal.duracionMs;

    const redimensionar = () => {
      const ratio = window.devicePixelRatio || 1;
      const ancho = window.innerWidth;
      const alto = window.innerHeight;

      canvas.width = Math.floor(ancho * ratio);
      canvas.height = Math.floor(alto * ratio);
      canvas.style.width = `${ancho}px`;
      canvas.style.height = `${alto}px`;

      contexto.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const lanzarExplosion = () => {
      const x = Math.random() * window.innerWidth;
      const y = 40 + Math.random() * window.innerHeight * 0.45;
      particulas = particulas.concat(crearParticulas(x, y, configuracionFinal.particulasPorExplosion));
    };

    const animar = (tiempo) => {
      if (!tiempoUltimo) tiempoUltimo = tiempo;
      const delta = tiempo - tiempoUltimo;
      tiempoUltimo = tiempo;

      if (tiempo - ultimaExplosion >= configuracionFinal.intervaloLanzamientoMs && tiempo <= tiempoFin) {
        ultimaExplosion = tiempo;
        lanzarExplosion();
      }

      contexto.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particulas = particulas.filter((particula) => particula.vida > 0.02);

      for (const particula of particulas) {
        particula.vx *= configuracionFinal.friccion;
        particula.vy = particula.vy * configuracionFinal.friccion + configuracionFinal.gravedad * (delta / 16.67);
        particula.x += particula.vx * (delta / 16.67);
        particula.y += particula.vy * (delta / 16.67);
        particula.vida -= particula.decaimiento * (delta / 16.67);

        contexto.globalAlpha = Math.max(0, particula.vida);
        contexto.fillStyle = particula.color;
        contexto.beginPath();
        contexto.arc(particula.x, particula.y, particula.tamano, 0, Math.PI * 2);
        contexto.fill();
      }

      contexto.globalAlpha = 1;

      if (tiempo <= tiempoFin || particulas.length > 0) {
        idAnimacion = requestAnimationFrame(animar);
      }
    };

    redimensionar();
    lanzarExplosion();
    window.addEventListener("resize", redimensionar);
    idAnimacion = requestAnimationFrame(animar);

    return () => {
      cancelAnimationFrame(idAnimacion);
      window.removeEventListener("resize", redimensionar);
      contexto.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [activo, configuracion]);

  return <canvas ref={referenciaCanvas} className="pointer-events-none fixed inset-0 z-50" aria-hidden="true" />;
}
