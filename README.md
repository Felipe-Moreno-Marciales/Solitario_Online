# Solitario Clásico Online

Aplicación web de **Solitario Clásico Online (Klondike)** desarrollada con **React + Vite + Tailwind CSS**.

El juego implementa robo de una carta, arrastrar y soltar, doble clic para autoenvío a bases y reciclado del descarte al mazo.

## Características

- Interfaz inspirada en el Solitario clásico.
- Reparto automático inicial de 52 cartas.
- Movimiento por **arrastrar y soltar** entre columnas, descarte y bases.
- Doble clic en carta superior para intentar enviarla a base.
- Botón **Auto a bases** para ayuda rápida.
- Conteo de movimientos.
- Detección de victoria cuando las 4 bases se completan.
- Diseño adaptable con utilidades de Tailwind.

## Tecnologías

- React 19
- Vite 7
- Tailwind CSS 4 (vía `@tailwindcss/vite`)
- ESLint 9

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm 9+

## Instalación

```bash
npm install
```

## Scripts disponibles

- Desarrollo local:

```bash
npm run dev
```

- Compilación de producción:

```bash
npm run build
```

- Vista previa de la compilación:

```bash
npm run preview
```

- Análisis de código:

```bash
npm run lint
```

## Estructura principal

```text
src/
	main.jsx                # Punto de entrada de React
	App.jsx                 # Renderiza el juego
	SolitarioOnline.jsx     # Lógica y UI principal del solitario
	index.css               # Import de Tailwind
public/                   # Recursos estáticos
vite.config.js            # Configuración Vite + base de despliegue
eslint.config.js          # Configuración de lint
```

## Reglas implementadas

- **Columnas**: cartas en orden descendente y alternando color.
- **Espacios vacíos de columnas**: solo se puede colocar Rey.
- **Bases**: por palo, comenzando por As y subiendo hasta Rey.
- **Robo**: una carta por clic desde el mazo al descarte.
- **Reciclado**: al vaciar el mazo, el descarte vuelve al mazo boca abajo.

## Controles

- **Clic en mazo**: roba carta o recicla descarte.
- **Arrastrar y soltar**: mueve cartas/pilas válidas.
- **Doble clic en carta superior**: intenta mover a base.
- **Botón “Nuevo”**: reinicia partida.
- **Botón “Auto a bases”**: intenta movimiento automático a bases.

## Autor

Desarrollado por **Felipe Moreno Marciales**.
