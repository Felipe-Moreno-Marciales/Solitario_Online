# Solitario Online

Aplicación web de **Solitario Clásico Online (Klondike)** desarrollada con **React + Vite + Tailwind CSS**.

El juego implementa arrastrar y soltar, doble clic para enviar a base, reciclado del descarte al mazo y niveles de dificultad.

## Características

- Interfaz inspirada en el Solitario clásico.
- Reparto automático inicial de 52 cartas.
- Movimiento por **arrastrar y soltar** entre columnas, descarte y bases.
- Doble clic en carta superior para intentar enviarla a base.
- Botón **Autocompletar** para ayuda rápida.
- Selector de dificultad: **Fácil**, **Medio** y **Mítica**.
- Conteo de movimientos.
- Detección de victoria cuando las 4 bases se completan.
- Celebración visual con **fuegos artificiales** al ganar.
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
	components/
		FuegosArtificiales.jsx # Overlay de celebración al ganar
	index.css               # Import de Tailwind
public/                   # Recursos estáticos
vite.config.js            # Configuración Vite + base de despliegue
eslint.config.js          # Configuración de lint
```

## Reglas implementadas

- **Columnas**: cartas en orden descendente y alternando color.
- **Espacios vacíos de columnas**: solo se puede colocar carta K.
- **Bases**: mismo símbolo (♠ ♥ ♦ ♣), desde carta A hasta carta K.
- **Robo y reciclado** según dificultad:
	- **Fácil**: roba 1 carta por clic, reciclado ilimitado, autocompletar activado.
	- **Medio**: roba 3 cartas por clic, reciclado ilimitado, autocompletar activado.
	- **Mítica**: roba 3 cartas por clic, máximo 1 reciclado, autocompletar desactivado.

## Controles

- **Clic en mazo**: roba carta o recicla descarte.
- **Arrastrar y soltar**: mueve cartas/pilas válidas.
- **Doble clic en carta superior**: intenta mover a base.
- **Selector “Dificultad”**: cambia reglas y reinicia la partida.
- **Botón “Nueva partida”**: reinicia partida.
- **Botón “Autocompletar”**: intenta movimiento automático a bases.

## Autor

Desarrollado por **Felipe Moreno Marciales**.
