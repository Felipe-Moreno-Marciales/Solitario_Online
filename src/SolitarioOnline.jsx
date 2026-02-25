import React, { useEffect, useMemo, useRef, useState } from "react";

// Solitario Clásico Online (Klondike, robo de una carta). Arrastra y suelta + doble clic o Autocompletar para enviar cartas a base.

const PALOS = ["♠", "♥", "♦", "♣"];
const VALORES = [
  { v: 1, t: "A" },
  { v: 2, t: "2" },
  { v: 3, t: "3" },
  { v: 4, t: "4" },
  { v: 5, t: "5" },
  { v: 6, t: "6" },
  { v: 7, t: "7" },
  { v: 8, t: "8" },
  { v: 9, t: "9" },
  { v: 10, t: "10" },
  { v: 11, t: "J" },
  { v: 12, t: "Q" },
  { v: 13, t: "K" },
];

function colorPalo(palo) {
  return palo === "♥" || palo === "♦" ? "red" : "black";
}

function textoValor(valor) {
  return VALORES.find((r) => r.v === valor)?.t ?? String(valor);
}

function barajar(arreglo) {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function crearMazo() {
  let id = 0;
  const mazo = [];
  for (const palo of PALOS) {
    for (let valor = 1; valor <= 13; valor++) {
      mazo.push({ id: `c_${id++}`, suit: palo, rank: valor, faceUp: false });
    }
  }
  return mazo;
}

function ultimaCarta(arreglo) {
  return arreglo.length ? arreglo[arreglo.length - 1] : null;
}

function puedeMoverABase(carta, pilaBase) {
  if (!carta) return false;
  if (pilaBase.length === 0) return carta.rank === 1; // carta A
  const cima = ultimaCarta(pilaBase);
  return cima.suit === carta.suit && carta.rank === cima.rank + 1;
}

function puedeMoverAColumna(carta, pilaColumna) {
  if (!carta) return false;
  if (pilaColumna.length === 0) return carta.rank === 13; // carta K
  const cima = ultimaCarta(pilaColumna);
  if (!cima.faceUp) return false;
  const colorOrigen = colorPalo(carta.suit);
  const colorDestino = colorPalo(cima.suit);
  return colorOrigen !== colorDestino && carta.rank === cima.rank - 1;
}

function esVictoria(bases) {
  return bases.every((b) => b.length === 13);
}

function parsearDatosArrastreSeguro(dataTransfer) {
  const llaves = ["application/json", "text/plain"];
  for (const llave of llaves) {
    try {
      const crudo = dataTransfer.getData(llave);
      if (!crudo) continue;
      const objeto = JSON.parse(crudo);
      if (objeto && typeof objeto === "object") return objeto;
    } catch {}
  }
  return null;
}

function Carta({ carta, arrastrable, alArrastrarInicio, alDobleClic, estilo, className = "" }) {
  const esRoja = colorPalo(carta.suit) === "red";
  return (
    <div
      style={estilo}
      className={
        "select-none rounded-xl border shadow-sm bg-white " +
        (carta.faceUp ? "" : "bg-gradient-to-br from-blue-600 to-blue-800 text-transparent") +
        " " +
        className
      }
      draggable={arrastrable}
      onDragStart={alArrastrarInicio}
      onDoubleClick={alDobleClic}
    >
      {carta.faceUp ? (
        <div className="p-2 flex items-start justify-between">
          <div className={"text-sm font-semibold " + (esRoja ? "text-red-600" : "text-slate-900")}>
            {textoValor(carta.rank)}{carta.suit}
          </div>
          <div className={"text-2xl leading-none " + (esRoja ? "text-red-600" : "text-slate-900")}>
            {carta.suit}
          </div>
        </div>
      ) : (
        <div className="p-2">
          <div className="h-2 w-10 bg-white/30 rounded" />
        </div>
      )}
    </div>
  );
}

export default function SolitarioOnline() {
  const [mazo, setMazo] = useState([]);
  const [descarte, setDescarte] = useState([]);
  const [bases, setBases] = useState([[], [], [], []]);
  const [columnas, setColumnas] = useState([[], [], [], [], [], [], []]);
  const [movimientos, setMovimientos] = useState(0);
  const [gano, setGano] = useState(false);

  const referenciaArrastre = useRef({});

  const marcadores = useMemo(
    () => ({
      mazo: "Mazo",
      descarte: "Descarte",
      bases: ["♠", "♥", "♦", "♣"],
    }),
    []
  );

  function nuevaPartida() {
    const baraja = barajar(crearMazo());
    const columnasIniciales = Array.from({ length: 7 }, () => []);
    let indice = 0;

    // Repartir columnas: 1..7, solo la última carta de cada pila boca arriba
    for (let columna = 0; columna < 7; columna++) {
      for (let fila = 0; fila <= columna; fila++) {
        const carta = { ...baraja[indice++], faceUp: fila === columna };
        columnasIniciales[columna].push(carta);
      }
    }

    // Cartas restantes al mazo (la superior queda al final)
    const mazoInicial = baraja.slice(indice).map((carta) => ({ ...carta, faceUp: false }));

    setColumnas(columnasIniciales);
    setMazo(mazoInicial);
    setDescarte([]);
    setBases([[], [], [], []]);
    setMovimientos(0);
    setGano(false);
  }

  useEffect(() => {
    nuevaPartida();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setGano(esVictoria(bases));
  }, [bases]);

  function incrementarMovimientos() {
    setMovimientos((actual) => actual + 1);
  }

  function robarDelMazo() {
    if (mazo.length > 0) {
      const carta = ultimaCarta(mazo);
      const siguienteMazo = mazo.slice(0, -1);
      const siguienteDescarte = [...descarte, { ...carta, faceUp: true }];
      setMazo(siguienteMazo);
      setDescarte(siguienteDescarte);
      incrementarMovimientos();
      return;
    }

    // Reciclar descarte al mazo
    if (descarte.length > 0) {
      const reciclado = [...descarte]
        .reverse()
        .map((carta) => ({ ...carta, faceUp: false }));
      setMazo(reciclado);
      setDescarte([]);
      incrementarMovimientos();
    }
  }

  function voltearSiHaceFalta(siguientesColumnas, columna) {
    const pila = siguientesColumnas[columna];
    if (pila.length === 0) return siguientesColumnas;
    const cima = ultimaCarta(pila);
    if (!cima.faceUp) {
      siguientesColumnas[columna] = [...pila.slice(0, -1), { ...cima, faceUp: true }];
    }
    return siguientesColumnas;
  }

  function extraerMovimiento(datos, estado) {
    const { mazo: estadoMazo, descarte: estadoDescarte, bases: estadoBases, columnas: estadoColumnas } = estado;
    const siguienteEstado = {
      mazo: [...estadoMazo],
      descarte: [...estadoDescarte],
      bases: estadoBases.map((pila) => [...pila]),
      columnas: estadoColumnas.map((pila) => [...pila]),
    };

    let cartasMovidas = [];

    if (datos?.origen === "descarte") {
      const carta = ultimaCarta(siguienteEstado.descarte);
      if (!carta) return { cartasMovidas: [], siguienteEstado };
      cartasMovidas = [{ ...carta }];
      siguienteEstado.descarte = siguienteEstado.descarte.slice(0, -1);
      return { cartasMovidas, siguienteEstado };
    }

    if (datos?.origen === "base") {
      const indiceBase = datos.indiceOrigen;
      const carta = ultimaCarta(siguienteEstado.bases[indiceBase] || []);
      if (!carta) return { cartasMovidas: [], siguienteEstado };
      cartasMovidas = [{ ...carta }];
      siguienteEstado.bases[indiceBase] = siguienteEstado.bases[indiceBase].slice(0, -1);
      return { cartasMovidas, siguienteEstado };
    }

    if (datos?.origen === "columna") {
      const indiceColumna = datos.indiceOrigen;
      const indiceInicio = datos.indiceInicio;
      const pila = siguienteEstado.columnas[indiceColumna] || [];
      if (indiceInicio == null || indiceInicio < 0 || indiceInicio >= pila.length) {
        return { cartasMovidas: [], siguienteEstado };
      }
      const porcion = pila.slice(indiceInicio);
      if (!porcion.length || !porcion[0].faceUp) return { cartasMovidas: [], siguienteEstado };
      // Asegurar que todas estén boca arriba
      if (porcion.some((carta) => !carta.faceUp)) return { cartasMovidas: [], siguienteEstado };

      cartasMovidas = porcion.map((carta) => ({ ...carta }));
      siguienteEstado.columnas[indiceColumna] = pila.slice(0, indiceInicio);
      siguienteEstado.columnas = voltearSiHaceFalta(siguienteEstado.columnas, indiceColumna);
      return { cartasMovidas, siguienteEstado };
    }

    return { cartasMovidas: [], siguienteEstado };
  }

  function confirmarEstado(siguienteEstado) {
    setMazo(siguienteEstado.mazo);
    setDescarte(siguienteEstado.descarte);
    setBases(siguienteEstado.bases);
    setColumnas(siguienteEstado.columnas);
    incrementarMovimientos();
  }

  function intentarAutocompletar(carta, datosOrigen) {
    if (!carta || !carta.faceUp) return false;

    const estado = { mazo, descarte, bases, columnas };
    const { cartasMovidas, siguienteEstado } = extraerMovimiento(datosOrigen, estado);
    if (cartasMovidas.length !== 1) return false;

    const cartaMover = cartasMovidas[0];
    for (let i = 0; i < 4; i++) {
      if (puedeMoverABase(cartaMover, siguienteEstado.bases[i])) {
        siguienteEstado.bases[i].push(cartaMover);
        confirmarEstado(siguienteEstado);
        return true;
      }
    }
    return false;
  }

  function manejarInicioArrastre(evento, datos) {
    referenciaArrastre.current = datos;
    evento.dataTransfer.effectAllowed = "move";
    evento.dataTransfer.setData("application/json", JSON.stringify(datos));
  }

  function permitirSoltar(evento) {
    evento.preventDefault();
    evento.dataTransfer.dropEffect = "move";
  }

  function soltarEnBase(evento, indiceBase) {
    evento.preventDefault();
    const datos = parsearDatosArrastreSeguro(evento.dataTransfer);
    if (!datos) return;

    const estado = { mazo, descarte, bases, columnas };
    const { cartasMovidas, siguienteEstado } = extraerMovimiento(datos, estado);
    if (cartasMovidas.length !== 1) return;

    const cartaMover = cartasMovidas[0];
    if (!puedeMoverABase(cartaMover, siguienteEstado.bases[indiceBase])) return;

    siguienteEstado.bases[indiceBase].push(cartaMover);
    confirmarEstado(siguienteEstado);
  }

  function soltarEnColumna(evento, indiceColumna) {
    evento.preventDefault();
    const datos = parsearDatosArrastreSeguro(evento.dataTransfer);
    if (!datos) return;

    const estado = { mazo, descarte, bases, columnas };
    const { cartasMovidas, siguienteEstado } = extraerMovimiento(datos, estado);
    if (!cartasMovidas.length) return;

    const primera = cartasMovidas[0];
    const pilaDestino = siguienteEstado.columnas[indiceColumna] || [];
    if (!puedeMoverAColumna(primera, pilaDestino)) return;

    siguienteEstado.columnas[indiceColumna] = [...pilaDestino, ...cartasMovidas];
    confirmarEstado(siguienteEstado);
  }

  const cartaSuperiorDescarte = ultimaCarta(descarte);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-700 to-emerald-900 text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl font-bold">Solitario Online</div>
            <div className="text-white/80 text-sm">Movimientos: {movimientos}{gano ? " · ¡Ganaste! 🏆" : ""}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20"
              onClick={nuevaPartida}
            >
              Nueva partida
            </button>
            <button
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20"
              onClick={() => {
                // Autocompletar: intenta mover la carta superior del descarte a una base si es posible
                if (cartaSuperiorDescarte) {
                  intentarAutocompletar(cartaSuperiorDescarte, { origen: "descarte" });
                  return;
                }
                // Autocompletar: si no hay descarte, intenta con las cartas superiores de las columnas
                for (let columna = 0; columna < 7; columna++) {
                  const cima = ultimaCarta(columnas[columna]);
                  if (cima && cima.faceUp) {
                    const movio = intentarAutocompletar(cima, {
                      origen: "columna",
                      indiceOrigen: columna,
                      indiceInicio: columnas[columna].length - 1,
                    });
                    if (movio) return;
                  }
                }
              }}
            >
              Autocompletar
            </button>
          </div>
        </div>

        {/* Fila superior */}
        <div className="mt-6 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            {/* Mazo */}
            <div>
              <div
                className="w-[92px] h-[128px] rounded-xl border border-white/25 bg-white/10 shadow-sm flex items-center justify-center cursor-pointer"
                onClick={robarDelMazo}
                title="Haz clic para robar o reciclar"
              >
                {mazo.length > 0 ? (
                  <div className="w-[84px] h-[120px] rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 border border-white/20" />
                ) : (
                  <div className="text-white/70 text-xs">{marcadores.mazo}</div>
                )}
              </div>
              <div className="mt-2 text-xs text-white/70">Haz clic</div>
            </div>

            {/* Descarte */}
            <div>
              <div
                className="w-[92px] h-[128px] rounded-xl border border-white/25 bg-white/10 shadow-sm flex items-center justify-center"
                onDragOver={permitirSoltar}
              >
                {cartaSuperiorDescarte ? (
                  <Carta
                    carta={cartaSuperiorDescarte}
                    arrastrable
                    alArrastrarInicio={(evento) => manejarInicioArrastre(evento, { origen: "descarte" })}
                    alDobleClic={() => intentarAutocompletar(cartaSuperiorDescarte, { origen: "descarte" })}
                    className="w-[84px] h-[120px]"
                  />
                ) : (
                  <div className="text-white/70 text-xs">{marcadores.descarte}</div>
                )}
              </div>
              <div className="mt-2 text-xs text-white/70">Arrastra o haz doble clic</div>
            </div>
          </div>

          {/* Bases */}
          <div className="flex items-start gap-4">
            {bases.map((pila, indiceBase) => {
              const cima = ultimaCarta(pila);
              return (
                <div key={indiceBase}>
                  <div
                    className="w-[92px] h-[128px] rounded-xl border border-white/25 bg-white/10 shadow-sm flex items-center justify-center"
                    onDragOver={permitirSoltar}
                    onDrop={(evento) => soltarEnBase(evento, indiceBase)}
                    title="Suelta la carta aquí"
                  >
                    {cima ? (
                      <Carta
                        carta={{ ...cima, faceUp: true }}
                        arrastrable
                        alArrastrarInicio={(evento) => manejarInicioArrastre(evento, { origen: "base", indiceOrigen: indiceBase })}
                        alDobleClic={() => {}}
                        className="w-[84px] h-[120px]"
                      />
                    ) : (
                      <div className="text-white/80 text-2xl">{marcadores.bases[indiceBase]}</div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-white/70">Base</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columnas */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {columnas.map((pila, indiceColumna) => {
            const altura = Math.max(6, pila.length + 1) * 26 + 110;
            return (
              <div key={indiceColumna} className="">
                <div
                  className="relative w-[92px]"
                  style={{ height: altura }}
                  onDragOver={permitirSoltar}
                  onDrop={(evento) => soltarEnColumna(evento, indiceColumna)}
                    title="Suelta la carta aquí"
                >
                  {/* Marcador de columna vacía (solo carta K) */}
                  <div className="absolute inset-x-0 top-0">
                    <div className="w-[92px] h-[128px] rounded-xl border border-white/25 bg-white/10 shadow-sm flex items-center justify-center">
                      {pila.length === 0 ? (
                        <div className="text-white/60 text-xs">K</div>
                      ) : (
                        <div className="text-white/0 text-xs">.</div>
                      )}
                    </div>
                  </div>

                  {pila.map((carta, indiceCarta) => {
                    const desplazamiento = carta.faceUp ? 26 : 18;
                    const arribaPx = indiceCarta * desplazamiento;
                    const arrastrable = carta.faceUp;

                    // Para columnas: permitir arrastrar cualquier carta boca arriba (pila desde idx)
                    const datosArrastre = {
                      origen: "columna",
                      indiceOrigen: indiceColumna,
                      indiceInicio: indiceCarta,
                    };

                    const esCima = indiceCarta === pila.length - 1;
                    const estiloCarta = { top: arribaPx, position: "absolute", left: 0, right: 0 };

                    return (
                      <Carta
                        key={carta.id}
                        carta={carta}
                        arrastrable={arrastrable}
                        alArrastrarInicio={(evento) => arrastrable && manejarInicioArrastre(evento, datosArrastre)}
                        alDobleClic={() => {
                          if (!esCima) return; // comportamiento clásico: solo la carta superior se autocompleta
                          if (!carta.faceUp) return;
                          intentarAutocompletar(carta, datosArrastre);
                        }}
                        estilo={estiloCarta}
                        className="w-[92px] h-[128px]"
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-sm text-white/80">
          <div className="font-semibold">Cómo jugar</div>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Columnas: alterna color y baja 1 valor (ejemplo: 10 sobre J).</li>
            <li>Columna vacía: solo entra carta K.</li>
            <li>Bases: mismo símbolo (♠ ♥ ♦ ♣), de carta A hasta carta K.</li>
            <li>Doble clic en la carta de arriba: se envía a base si es posible.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}