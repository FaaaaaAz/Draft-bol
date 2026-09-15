# Tupay — Guía de estudio para la defensa

Esta guía explica el repositorio completo para preparar la exposición: qué hay en cada carpeta, qué
hace cada archivo, cómo viaja una jugada de punta a punta y dónde está cada regla. Al final hay
preguntas de práctica con sus respuestas, del tipo que puede hacer el docente.

No repite el código línea por línea. Cita **archivos y nombres de funciones o constantes**, que es
lo que se busca en VS Code con `Ctrl + P` (archivo) y `Ctrl + Shift + F` (texto en todo el proyecto).

---

## 1. La idea en 30 segundos

- **Express decide, React presenta.** Ninguna regla del juego vive en el navegador.
- React captura el gesto (arrastrar una tapita), lo manda por `fetch` como JSON, y Express valida,
  simula la física y aplica las reglas.
- Express responde **el recorrido completo** (todas las posiciones cuadro a cuadro), los eventos
  (gol, perro, charco), los golpes que suenan y el estado nuevo de la partida.
- React **anima** ese recorrido y al final aplica el estado que confirmó el servidor.
- `compartido/` tiene los tipos del contrato JSON, que usan los dos lados.

```text
 Navegador (React)                          Servidor (Express)
 ────────────────                           ──────────────────
 Cancha.tsx  ── gesto ──▶ usePartida.ts
                          api/partidas.ts ── POST /api/partidas/:id/tiros ──▶ rutas/partidas.ts
                                                                               │ lecturaPeticiones.ts (forma)
                                                                               ▼
                                                                    servicios/servicioPartidas.ts
                                                                               │
                                                                               ▼
                                                                    dominio/reglas/tiro.ts (reglas)
                                                                               │
                                                                               ▼
                                                                    dominio/fisica/simulacion.ts
                          ◀── JSON: recorrido, eventos, contactos, partida ───┘
 useAnimacion.ts anima cuadro a cuadro, audio suena en cada golpe, se aplica la partida final
```

---

## 2. Raíz del repositorio

| Archivo | Qué es |
|---|---|
| `package.json` | Dependencias y comandos (`dev`, `build`, `start`, `lint`, `typecheck`, `test:unit`, `test:e2e`…). Producción: solo `express`, `react` y `react-dom`. |
| `package-lock.json` | Versiones exactas instaladas. Lo usa `npm ci` en GitHub Actions. |
| `tsconfig.base.json` | Opciones de TypeScript compartidas: `strict`, sin variables sin usar, etc. |
| `tsconfig.json` | Revisa `compartido/`, `e2e/` y las configuraciones de la raíz. |
| `client/tsconfig.json`, `server/tsconfig.json`, `server/tsconfig.test.json` | TypeScript del cliente, del servidor compilado y del servidor con sus pruebas. |
| `vite.config.ts` | Vite: raíz en `client/`, compila a `dist/cliente` y en desarrollo reenvía `/api` a `localhost:3000` (proxy). |
| `eslint.config.js` | ESLint para TypeScript; globals de navegador en `client/` y de Node en `server/`, `e2e/` y scripts. |
| `playwright.config.ts` | Pruebas E2E locales: compila, levanta `npm start` en un puerto y corre en Chromium (`chromium`) o en Chrome visible (`chrome`). |
| `playwright.prod.config.ts` | Las mismas pruebas contra `URL_PRODUCCION`, con esperas largas por el arranque en frío de Render. |
| `AGENTS.md` | Reglas de trabajo para el asistente de IA (sin commits propios, en español). |
| `README.md` | Instalación, comandos, arquitectura, API, pruebas y despliegue. |
| `.github/workflows/ci.yml` | Pipeline: Lint → Pruebas unitarias y E2E → Deploy a Render (y E2E contra producción). |
| `.gitignore` | Excluye `node_modules`, `dist`, reportes de Playwright, etc. |

---

## 3. `compartido/` — el contrato JSON

Solo tipos, sin lógica. Si cambia la forma de un JSON, el cliente y el servidor dejan de compilar.

| Archivo | Tipos principales |
|---|---|
| `partida.ts` | `Partida` (estado completo), `Tapita`, `Pelota`, `Charco`, `Jugador`, `Reloj`, `Resultado`, `PeticionCrearPartida`, `PeticionTiro`, `Cuadro`, `Contacto` (`patear`, `choque`, `pared`, `charcoDeAgua`, `charcoDeNieve`), `Evento` (`gol`, `perro`, `pelotaAtrapada`, `pelotaLiberada`, `turnoPerdido`, `finDelPartido`), `RespuestaTiro`, `OpcionesDePrueba` (semilla, duraciones, probabilidad del perro). |
| `catalogo.ts` | `IdEquipo` (10 equipos), `IdEstadio` (6), `EfectoEstadio`, `Equipo`, `Estadio`, `IdEmote` (7 caritas). |
| `temporada.ts` | `Temporada`, `PartidoDeTemporada`, `FilaTabla`, peticiones para crear una temporada y jugar un partido. |
| `errores.ts` | `RespuestaError`: todos los errores son `{ "error": "mensaje" }`. |
| `salud.ts` | `RespuestaSalud`: `{ estado, juego, version }`. |
| `geometria.ts` | `Vector` `{ x, y }`. |

---

## 4. `server/src/` — Express

### 4.1 Arranque y capa HTTP

| Archivo | Qué hace |
|---|---|
| `index.ts` | Punto de entrada: crea la app y escucha en `PUERTO`. |
| `configuracion.ts` | `PUERTO` (variable `PORT`, por defecto 3000), `VERSION` (commit que expone Render en `RENDER_GIT_COMMIT`) y la carpeta del cliente compilado. |
| `app.ts` | `crearApp()`: arma los servicios con sus repositorios en memoria, registra `express.json()`, las rutas `/api/...`, el 404 JSON de la API, sirve el cliente compilado (con caché larga para `/assets`) y el `manejadorDeErrores`. Aquí se ve que frontend y backend comparten **dominio y puerto**. |
| `rutas/salud.ts` | `GET /api/salud`. |
| `rutas/catalogo.ts` | `GET /api/equipos` y `GET /api/estadios`. |
| `rutas/partidas.ts` | Crear, consultar, pausar, reanudar, abandonar, tirar, turno del rival y emotes. Rutas **delgadas**: leen, llaman al servicio y responden. |
| `rutas/temporadas.ts` | Crear, consultar y jugar un partido de temporada. |
| `rutas/lecturaPeticiones.ts` | Revisa la **forma** del cuerpo JSON (tipos, campos obligatorios, valores permitidos): `leerPeticionCrearPartida`, `leerPeticionTiro`, `leerPeticionEmote`, `leerPeticionCrearTemporada`, `leerPeticionJugarPartido`. |
| `rutas/manejadorDeErrores.ts` | Único lugar que convierte errores en HTTP: `ErrorDeJuego` → su código (400, 404, 409); JSON inválido → 400; cualquier otro → 500 sin detalles. |

### 4.2 Servicios y repositorios

| Archivo | Qué hace |
|---|---|
| `servicios/servicioPartidas.ts` | Clase `ServicioPartidas`: coordina cada caso de uso. Busca la partida, aplica la regla del dominio, la guarda y devuelve `aPartidaPublica`. En `jugar` arma la `RespuestaTiro` con `cuadrosPorSegundo`. |
| `servicios/servicioTemporadas.ts` | Clase `ServicioTemporadas`: crea temporadas, crea las partidas de Liga de cada partido usando `ServicioPartidas` y `sincronizar` anota resultados al consultar. |
| `repositorios/repositorioPartidas.ts` | Interfaz `RepositorioPartidas` y `RepositorioPartidasEnMemoria` (un `Map`). Un reinicio borra las partidas. |
| `repositorios/repositorioTemporadas.ts` | Lo mismo para temporadas. |

### 4.3 `dominio/` — las reglas del juego

**Generales**

| Archivo | Qué hace |
|---|---|
| `dominio/catalogo.ts` | `EQUIPOS` (nombre, departamento, estadio y colores) y `ESTADIOS` (ciudad y efecto). Agregar un equipo es tocar solo este archivo (y sus imágenes). |
| `dominio/mensajes.ts` | `MENSAJES`: todos los textos de error que ve el jugador. |
| `dominio/errores.ts` | `ErrorDeJuego`: error previsto con su código HTTP. |

**`dominio/fisica/` — la física propia (no sabe de equipos ni de turnos)**

| Archivo | Qué hace |
|---|---|
| `configuracionFisica.ts` | `CANCHA` (1200 × 700, arco de 180, radios de tapita 28 y pelota 18), `ARCO` y `FISICA`: 60 pasos por segundo con 8 subpasos, un cuadro cada 2 pasos (30 cuadros por segundo), velocidad máxima 1500, masas, retención (fricción), rebotes, velocidad mínima y tope de 20 s. **Todos los números de la física están aquí.** |
| `cuerpo.ts` | `Cuerpo` (posición, velocidad, radio, masa inversa, retención) y `crearTapita`, `crearPelota`, `crearPostes` (círculos fijos con masa inversa 0), `enReposo`. |
| `movimiento.ts` | `mover`: avanza y frena con fricción exponencial (`retencion ** dt`). `rebotarEnParedes`: rebota en los bordes; solo la pelota pasa por la boca del arco. |
| `colisiones.ts` | `resolverColision`: choque elástico entre círculos por impulso (separa y cambia velocidades). `resolverColisiones` revisa todos los pares y avisa cada golpe. |
| `goles.ts` | `detectarGol`: hay gol cuando la pelota cruzó **entera** la línea entre los postes. Devuelve el arco (`izquierdo` o `derecho`). |
| `charcos.ts` | La física del charco como elipse: `atraparSiEntra` (fija la pelota como un poste), `golpearPelotaAtrapada` (descuenta golpes o libera con el tiro de poder) y `CaidaEnCharco`. |
| `simulacion.ts` | `simularTiro`: el bucle principal. Cada paso llama a `avanzarUnPaso` (mover → golpear pelota atrapada → choques → paredes → charcos → gol), fotografía cuadros, anota `contactos` y `caidasEnCharcos`, y termina en reposo, gol o tope. |

**`dominio/reglas/` — el partido**

| Archivo | Qué hace |
|---|---|
| `configuracionReglas.ts` | `REGLAS` (meta de goles, 15 s por turno, 300 s de Liga, 2 tiros de poder ×1,5, perro 12 % y máximo 5, emotes 5 s y espera 15 s), `RIVAL` (dificultades y puntuación) y `TEMPORADA` (puntos y probabilidades de goles simulados). **Los números que se cambian en la defensa.** |
| `partida.ts` | `RegistroPartida` (lo que guarda el servidor), `crearRegistro` (formación, sorteo del saque, reloj, perro, charcos iniciales), `finalizar` y validaciones (equipos repetidos, meta de goles, opciones de prueba). |
| `formacion.ts` | `formacionInicial`: 5 tapitas por lado en espejo (arquero, dos defensas, dos delanteros) y `CENTRO_DE_LA_CANCHA`. |
| `lados.ts` | `rival(lado)` y `ladoQueAnota(arco)`: el local defiende el arco izquierdo. |
| `tiro.ts` | `ejecutarTiro`: **el corazón de las reglas**. Valida (`validarTiro`), simula, aplica charcos, gol, perro, turno y final. `tirarComoHumano` y `jugarTurnoDelRival`. |
| `simulacionEnLaPartida.ts` | `simularEnLaPartida`: prepara la simulación con el estado real (charcos, tiro de poder). La usan el tiro de verdad y el rival cuando prueba candidatos. |
| `tiempo.ts` | `actualizarTiempo`: sin temporizadores; en cada consulta calcula si se venció el turno o terminó la Liga. `relojPublico` y `segundosRestantesDelTurno`. |
| `pausa.ts` | `cambiarPausa`: al reanudar corre los orígenes de los relojes por lo que duró la pausa. `exigirSinPausa`: tirar pausado da 409. |
| `emotes.ts` | `lanzarEmote`, `emoteActivo`, `segundosDeEsperaDelEmote`. |
| `vistaPublica.ts` | `aPartidaPublica`: convierte el registro interno al JSON `Partida` (con segundos restantes calculados al momento). |

**`dominio/estadios/`, `dominio/eventos/`, `dominio/rival/`, `dominio/temporada/`**

| Archivo | Qué hace |
|---|---|
| `estadios/configuracionEstadios.ts` | `CHARCOS` (agua: dura 2 tiros, 1 golpe; nieve: 4 tiros, 2 golpes), `APARICION_DE_CHARCOS` (2 al empezar, 40 % por tiro, máximo 3) y qué efecto da charcos de qué tipo. |
| `estadios/charcos.ts` | `crearCharcosIniciales`, `avanzarCharcos` (se secan y aparecen nuevos), `zonasDeCharco` (se los pasa a la física), `eventosDeCharco` y `contactosDeCharco` (el splash de agua o nieve). |
| `eventos/perro.ts` | `intentarAparicion`: sortea si entra, elige dónde dejar la pelota (`elegirDestino`) y arma su animación (`animarPerro`). |
| `rival/billar.ts` | `tiroDeBillar`: apunta como en el billar al punto de la pelota opuesto al arco que ataca, con la fuerza justa. `limitarFuerza`. |
| `rival/rivalPorMuestreo.ts` | `decidirTiroDelRival`, `generarCandidatos`, `puntuar`: el rival del servidor. |
| `temporada/temporada.ts` | `crearRegistroTemporada`, `avanzarTemporada` (simula las jornadas sin personas), `peticionParaJugar`, `registrarResultado`, `aTemporadaPublica`, validaciones. |
| `temporada/calendario.ts` | `barajar` (Fisher-Yates con semilla) y `generarCalendario` (método del círculo: todos contra todos a una vuelta). |
| `temporada/tabla.ts` | `calcularTabla`: la tabla no se guarda, se calcula; ordena por puntos, diferencia y goles a favor. |
| `temporada/marcadorSimulado.ts` | `simularMarcador`: goles al azar según `TEMPORADA.probabilidadDeGoles`. |

### 4.4 `utilidades/`

| Archivo | Qué hace |
|---|---|
| `azar.ts` | `crearAzar(semilla)`: generador mulberry32. Con la misma semilla, la misma secuencia: por eso las pruebas con azar son repetibles. |
| `vector.ts` | Operaciones de vectores: `sumar`, `restar`, `escalar`, `productoPunto`, `longitud`, `normalizar`, `interpolar`, `redondear`. |

### 4.5 Pruebas unitarias del servidor (`*.test.ts`, con `node:test`)

`fisica/simulacion.test.ts`, `fisica/charcos.test.ts`, `fisica/goles.test.ts`, `estadios/charcos.test.ts`,
`eventos/perro.test.ts`, `reglas/reglas.test.ts` (crear partida, turnos, goles, charcos, perro),
`reglas/emotes.test.ts`, `reglas/pausa.test.ts`, `rival/rival.test.ts`, `temporada/temporada.test.ts`,
`servicios/servicioTemporadas.test.ts`, `utilidades/azar.test.ts` y `utilidades/vector.test.ts`.

---

## 5. `client/src/` — React

### 5.1 Entrada y navegación

| Archivo | Qué hace |
|---|---|
| `client/index.html` | HTML con el `div#raiz`. |
| `main.tsx` | Monta `<App />` en `StrictMode` e importa los tres CSS. |
| `App.tsx` | **Navegación sin router**: la pantalla actual es un estado (`portada`, `menu`, `instrucciones`, `configuracion`, `configurarTemporada`, `temporada`, `partida`, `resultado`). Al cambiar de pantalla elige la música y precarga sonidos. Pide el catálogo con `useCatalogo`. |

### 5.2 `api/` — la única salida hacia Express

| Archivo | Qué hace |
|---|---|
| `cliente.ts` | `pedir`: **la única función que llama a `fetch`**. `obtener` (GET) y `enviar` (POST JSON). Si Express responde error, lanza `ErrorDeApi` con el mensaje del servidor. |
| `partidas.ts` | `crearPartida`, `obtenerPartida`, `tirar`, `jugarTurnoRival`, `lanzarEmote`, `cambiarPausa`, `abandonarPartida`. |
| `temporadas.ts` | `crearTemporada`, `obtenerTemporada`, `jugarPartidoDeTemporada`. |
| `catalogo.ts`, `salud.ts` | Equipos, estadios y salud del servidor. |

### 5.3 `hooks/` — la lógica de pantalla

| Archivo | Qué hace |
|---|---|
| `usePartida.ts` | **Coordina la partida en curso.** Guarda el estado confirmado por Express, reproduce jugadas (`reproducir`), cuenta el turno cada 250 ms, pide el turno del rival cuando le toca (espera `PAUSA_DEL_RIVAL_MS` = 800 ms), lanza emotes, pausa y abandona, hace sonar golpes, perro y gol, y entrega `relojDeLiga`. Ningún componente visual llama a la API. |
| `useAnimacion.ts` | Reproduce el recorrido con `requestAnimationFrame`, interpola entre cuadros y calcula el giro de la pelota (`ángulo = distancia / radio`). Se detiene en pausa. |
| `useCrearPartida.ts` | Precarga imágenes y crea la partida; evita envíos dobles. |
| `useCrearTemporada.ts`, `useTemporada.ts` | Crear temporada; cargarla y jugar un partido. |
| `useCatalogo.ts` | Pide equipos y estadios a Express (el cliente no tiene la lista escrita) y `equipoPorId`. |
| `useSalud.ts` | Consulta `/api/salud` para la portada. |

### 5.4 `pantallas/`

| Archivo | Qué muestra |
|---|---|
| `Portada.tsx` | Imagen de inicio, botón **Iniciar** y versión del servidor. |
| `Menu.tsx` | Título ilustrado y las 4 tarjetas (Eliminatoria, Liga, Temporada, Cómo se juega). |
| `Configuracion.tsx` | Configurar Eliminatoria o Liga: jugadores, dificultad, equipos, estadio, meta o duración y perro. Arma `PeticionCrearPartida`. |
| `ConfigurarTemporada.tsx` | Configurar una temporada: 1 o 2 jugadores, equipos, dificultad, duración y perro. |
| `Temporada.tsx` | Próximo partido, tabla de posiciones y calendario; con dos personas, quién controla al rival. |
| `Partida.tsx` | Marcador (con emotes y reloj), avisos, cancha, pie con turno, tiro de poder, pausa y salir, y los modales. Toca el silbato al pausar y el sonido de salir. |
| `Resultado.tsx` | Ganador o empate, marcador con escudos, revancha (solo partidas sueltas). |
| `Instrucciones.tsx` | Cómo se juega, con imágenes de charcos y emotes. |

### 5.5 `componentes/`

| Archivo | Qué hace |
|---|---|
| `Cancha.tsx` | **SVG de la cancha**: estadio de fondo, charcos, tapitas, perro, pelota, arcos y la flecha. Convierte el arrastre en tiro (`calcularTiro`: sale al lado contrario del arrastre; fuerza = distancia / 240, mínimo 25). No decide nada del juego. |
| `calibracionCancha.ts` | Cómo encajar la física (1200 × 700) sobre la imagen del estadio: escala, origen, arcos, tamaños de sprites y charcos. |
| `RelojDeLiga.tsx` | Minutos y segundos de juego contados cuadro a cuadro desde el último dato de `usePartida`. |
| `AvisoDeJugada.tsx` | Aviso breve (turno, gol, perro, charco, final) que se congela en pausa. |
| `BarraDeEmotes.tsx` | Las 7 caritas de un jugador y su espera. |
| `Modal.tsx` | Diálogo nativo accesible (foco atrapado, Esc) con el árbitro de pausa o de salir. |
| `ControlesAudio.tsx` | Ícono de sonido que abre silencio y volúmenes. |
| `Carrusel.tsx`, `SelectorDeEquipo.tsx`, `SelectorDeEstadio.tsx` | Carruseles de escudos y estadios con flechas y teclado. |
| `GrupoDeOpciones.tsx` | Radios centrados que suenan al elegir. |
| `CasillaDelPerro.tsx` | Casilla del perro con su imagen; ladra al activarla. |
| `opcionesDeJuego.ts` | Listas de la interfaz: duraciones de Liga, jugadores, dificultades, emotes y descripción de efectos. |

### 5.6 `audio/`

| Archivo | Qué hace |
|---|---|
| `MotorAudio.ts` | Clase `MotorAudio` con Web Audio: un `AudioContext` creado tras el primer gesto (`desbloquear`), cuatro canales (`musica`, `interfaz`, `efectos`, `reacciones`), buffers en caché, máximo 4 efectos a la vez, intervalo mínimo por sonido, descarta cargas de más de 350 ms, preferencias en `localStorage` (`tupay.audio.v1`), `pausar`, `ocultar`. No conoce React. |
| `catalogo.ts` | Lee `assets/audio/catalogo.json` y resuelve las URLs con `import.meta.glob`. |
| `audio.ts` | La instancia única `audio` y `sonarAlElegir` (desbloquea y suena). |
| `sonidosDelJuego.ts` | `SONIDOS_DE_PARTIDA` (se precargan al entrar a configurar), `SONIDO_DE_EMOTE` y `sonidoDelResultado` (victoria, derrota o empate). |
| `MotorAudio.test.ts` | Pruebas unitarias del motor con un `AudioContext` falso. |

### 5.7 `recursos/` y `estilos/`

| Archivo | Qué hace |
|---|---|
| `recursos/indice.ts` | Importa cada imagen (Vite les pone hash) y las agrupa: `IMAGEN_DE_EQUIPO`, `IMAGEN_DE_ESCUDO`, `IMAGEN_DE_ESTADIO`, `IMAGEN_DE_EMOTE`, `IMAGEN_DE_CHARCO`, `IMAGEN_DE_TARJETA`, `IMAGENES`. Si falta una imagen de un equipo o estadio del contrato, no compila. |
| `recursos/precargar.ts` | `precargarImagen` y `precargarPartida`: descarga y decodifica antes de abrir la cancha. |
| `estilos/global.css` | Variables de color (`--dorado`, `--noche`…), botones, modales, portada, menú, paneles, configuración, temporada y carruseles. |
| `estilos/partida.css` | Marcador (con su fondo), cancha, tapitas, flecha de potencia, avisos, emotes y pausa. |
| `estilos/audio.css` | El ícono y el panel de sonido. |

---

## 6. Imágenes

- **Originales:** `assets/` (PNG pesados, no se publican). `players/` tapitas, `teams/` escudos,
  `stadium/` estadios, `items/` pelota, perro, arco y charcos, `emotes/` caritas, `UI/` portada, menú,
  tarjetas, fondos, título, marcador y árbitros.
- **Versiones web:** `client/src/recursos/` en WebP: `equipos/`, `escudos/`, `estadios/`, `juego/`,
  `emotes/`, `pantallas/`, `tarjetas/`.
- **Cómo se generan:** `scripts/optimizar-recursos.mjs` con `sharp` (instalado con `--no-save`). Grupos:
  `tapitas`, `escudos`, `estadios`, `pantallas`, `paneles`, `tarjetas`, `interfaz`, `modales`, `juego`,
  `emotes`. Recorta márgenes transparentes y reduce tamaño sin perder calidad visible.
- **Cómo llegan a pantalla:** se importan en `recursos/indice.ts`; los fondos de paneles y del marcador
  se dibujan desde CSS (`url(...)`). Las imágenes las generó el autor con gpt-image; los escudos no son
  los oficiales (ver `docs/decisiones.md`).
- **Opacidad del fondo del menú:** `global.css`, regla `.menu::before` (su `background` oscurece la imagen).

## 7. Audio

- **Originales:** `assets/audio/` (`music/` y `sfx/`), con licencias en `assets/audio/licencias/` y el
  inventario en `assets/audio/README.md`.
- **Catálogo:** `assets/audio/catalogo.json` define para cada sonido su id, archivo, autor, licencia,
  canal, ganancia, intervalo y si es bucle.
- **Versiones web:** `client/src/recursos/audio/`, misma ruta relativa.
- **Cuándo suena cada cosa:**

| Sonido | Dónde se dispara |
|---|---|
| Música de menú / partido / resultado | `App.tsx` al navegar (`audio.reproducirMusica`). |
| Clic de carruseles y radios | `Carrusel.tsx`, `GrupoDeOpciones.tsx` (`sonarAlElegir`). |
| Ladrido al activar el perro | `CasillaDelPerro.tsx`. |
| Pitido de inicio | `App.tsx` al entrar a la partida. |
| Selección y resortera al apuntar | `Cancha.tsx`. |
| Patear, choque, pared, splash | `usePartida.ts` → `sonarGolpesHasta`, en el cuadro de cada `contacto`. |
| Gol | `usePartida.ts` al terminar la animación. |
| Ladrido del perro en la cancha | `usePartida.ts`, cuando aparece en un cuadro. |
| Emote | `usePartida.ts` después de que Express acepta. |
| Silbato de pausa y sonido de salir | `Partida.tsx` (`sonidoDelModal`). |
| Fin del partido | `Partida.tsx`. |

- **Sin sonido se puede jugar igual:** si Web Audio falla o está silenciado, el motor no rompe nada.

---

## 8. Pruebas, scripts, CI y documentación

**`e2e/` (Playwright, 55 pruebas)**

| Archivo | Qué comprueba |
|---|---|
| `ayudantes.ts` | Pasos comunes: `abrirMenu`, `elegirEnElMenu`, `empezarPartido`, `tirar` (arrastra como una persona), `aPantalla`, `GOL_DESDE_EL_SAQUE`. |
| `observarAudio.ts` | Observa las fuentes reales de Web Audio para contar cuántas veces suena algo. |
| `salud.spec.ts`, `inicio.spec.ts` | La app carga; se crea Eliminatoria y Liga y se ve la cancha; el reloj avanza. |
| `interaccion.spec.ts` | Arrastrar una tapita manda el tiro y la cancha termina donde dijo el servidor. |
| `partidas.spec.ts` | API directa: crear, consultar, tirar, turno rival, 404. |
| `validaciones.spec.ts` | Mismo equipo: se ve el mensaje de Express. |
| `finalizacion.spec.ts` | Eliminatoria a un gol termina; Liga termina por tiempo y puede empatar. |
| `temporada.spec.ts` | Simulación de jornadas, orden de jornadas y un partido jugado que actualiza la tabla. |
| `estadios-y-emotes.spec.ts` | Charcos por estadio y emotes con espera. |
| `pulido.spec.ts` | Pausa, salida, cancelar arrastres, doble clic, rival en pausa, caché de imágenes. |
| `presentacion.spec.ts` | Potencia, avisos, perro, nieve y diseño en tres tamaños sin desplazamiento. |
| `audio.spec.ts`, `audio-juego.spec.ts` | Música, silencio, decodificación de todos los audios, sonidos de tiro, gol, perro, charco, salir y emotes. |
| `defensa.spec.ts` | Recorrido `@defensa`: partido en la URL pública, emote y gol final en menos de 30 s. |

**`scripts/`**

| Archivo | Qué hace |
|---|---|
| `dev.mjs` | Levanta `dev:server` y `dev:client` a la vez. |
| `optimizar-recursos.mjs` | Genera las imágenes web desde `assets/`. |
| `generar-aplausos.mjs` | Sintetiza el aplauso del empate (sin grabaciones). |
| `buscar-tiro-de-gol.ts` | Busca con la física un tiro que haga gol desde el saque; de ahí sale `GOL_DESDE_EL_SAQUE`. |

**CI/CD (`.github/workflows/ci.yml`):** en cada push a `main`: (1) Lint y tipos, (2) unitarias y E2E
headless, (3) si ambos pasan, Deploy Hook a Render, espera a que `/api/salud` informe ese commit y
repite las E2E contra la URL pública.

**`docs/`:** `introduccion.md` (idea), `reglas.md` (reglamento), `plan.md` (fases), `api.md` (contrato con
ejemplos reales), `boceto.md` (pantallas y recursos), `decisiones.md` (decisiones, riesgos y cambios),
`investigacion.md` (Playwright, Render, tiempos), `uso-ia.md` (registro de IA) y `evidencias/`.

---

## 9. Recorridos completos

### 9.1 Crear un partido
1. `Configuracion.tsx` arma `PeticionCrearPartida` y `useCrearPartida` precarga imágenes.
2. `api/partidas.ts` → `POST /api/partidas`.
3. `leerPeticionCrearPartida` revisa la forma → `ServicioPartidas.crear` → `crearRegistro`: valida equipos
   distintos y meta, arma la formación, sortea el saque con la semilla, crea reloj y charcos iniciales.
4. Responde `201` con `aPartidaPublica`. `App.tsx` cambia a la pantalla `partida`.

### 9.2 Un tiro de una persona
1. `Cancha.tsx`: `empezarAApuntar` → `seguirApuntando` (flecha) → `soltar` → `calcularTiro`.
2. `usePartida.tirar` agrega el `lado` y llama a `reproducir`.
3. `POST /api/partidas/:id/tiros` → `leerPeticionTiro` → `ServicioPartidas.tirar` → `tirarComoHumano`.
4. `ejecutarTiro` → `validarTiro` (pausa, tiempo, terminada, turno, tapita propia, fuerza, tiros de poder).
5. `simularEnLaPartida` → `simularTiro` produce cuadros, contactos y caídas en charcos.
6. Reglas: charcos, gol (o perro), turno al rival, avanzar charcos, reloj del próximo turno.
7. Respuesta con `recorrido`, `eventos`, `contactos`, `cuadrosPorSegundo`, `partida`.
8. `useAnimacion` anima; `sonarGolpesHasta` suena cada golpe en su cuadro; `terminarAnimacion` aplica la partida.

### 9.3 El turno del servidor
1. En `usePartida`, cuando la cancha está libre y le toca a un jugador de tipo `servidor`, espera 800 ms.
2. `POST /api/partidas/:id/turno-rival` → `jugarTurnoDelRival` verifica que de verdad le toque al servidor.
3. `decidirTiroDelRival` elige el tiro y `ejecutarTiro` lo aplica con **las mismas reglas** que a una persona.

### 9.4 Fin del partido
- **Eliminatoria:** en `ejecutarTiro`, si el gol alcanza `golesParaGanar`, `finalizar` y evento `finDelPartido`.
- **Liga:** `actualizarTiempo` finaliza cuando pasó `duracionMs`; puede ser empate (`ganador: null`).
- React ve `estado: "finalizada"`, espera 1,8 s (`PAUSA_ANTES_DEL_RESULTADO_MS`) y muestra `Resultado`.

---

## 10. Números que se cambian en vivo

| Qué cambiar | Archivo | Constante |
|---|---|---|
| Meta de goles por defecto (1 a 5) | `server/src/dominio/reglas/configuracionReglas.ts` | `REGLAS.golesParaGanarPorDefecto` (y el estado inicial `golesParaGanar` en `Configuracion.tsx`) |
| Duración real de la Liga | `configuracionReglas.ts` | `REGLAS.duracionLigaSegundos`; opciones de la pantalla en `client/src/componentes/opcionesDeJuego.ts` → `DURACIONES_DE_LIGA` |
| Segundos por turno | `configuracionReglas.ts` | `REGLAS.limiteTurnoSegundos` |
| Probabilidad y máximo del perro | `configuracionReglas.ts` | `REGLAS.probabilidadPerro`, `REGLAS.aparicionesMaximasDelPerro` |
| Fuerza del tiro de poder | `configuracionReglas.ts` | `REGLAS.multiplicadorTiroDePoder`, `REGLAS.tirosDePoderPorPartido` |
| Dificultad del rival | `configuracionReglas.ts` | `RIVAL.dificultades` (candidatos y error de puntería) |
| Fricción y rebotes | `server/src/dominio/fisica/configuracionFisica.ts` | `FISICA.retencionTapita`, `retencionPelota`, `reboteParedes`, `reboteEntreCuerpos` |
| Charcos de un tipo de estadio | `server/src/dominio/estadios/configuracionEstadios.ts` | `CHARCOS.agua` / `CHARCOS.nieve`, `APARICION_DE_CHARCOS` |
| Qué efecto tiene un estadio | `server/src/dominio/catalogo.ts` | `ESTADIOS[...].efecto` |
| Un texto de error | `server/src/dominio/mensajes.ts` | `MENSAJES` |
| Un texto de pantalla | El `.tsx` de esa pantalla | Texto en el JSX |
| Un color | `client/src/estilos/global.css` | Variables de `:root` (`--dorado`, `--noche`…) |
| Puntos de la temporada | `configuracionReglas.ts` | `TEMPORADA.puntosPorVictoria`, `puntosPorEmpate` |

Después de cambiar algo: `npm run lint`, `npm run test:unit` y, si toca la interfaz, `npm run test:e2e`.

---

## 11. Preguntas de práctica

### Arquitectura y comunicación

**¿Qué hace React y qué hace Express?**
Express decide todo lo que afecta el resultado: valida, simula la física, aplica reglas, mueve al rival y
guarda el estado. React captura la interacción, llama a la API con `fetch`, anima lo que responde el
servidor y muestra el estado confirmado.

**¿Dónde se llama a `fetch`?**
Solo en `client/src/api/cliente.ts`, función `pedir`. Los archivos de `api/` usan `obtener` y `enviar`, y
los hooks (`usePartida`, `useCrearPartida`, `useTemporada`) los llaman. Ningún componente visual toca la API.

**¿Cómo se garantiza que cliente y servidor hablen el mismo JSON?**
Los dos importan los tipos de `compartido/`. Si cambio un campo en `compartido/partida.ts`, TypeScript
marca el error en ambos lados antes de ejecutar.

**¿Por qué están en el mismo dominio y puerto?**
En producción `server/src/app.ts` sirve el cliente compilado (`dist/cliente`) y la API bajo `/api`. En
desarrollo Vite reenvía `/api` a Express con el proxy de `vite.config.ts`, así el navegador siempre ve un origen.

**¿Qué pasa si mando un JSON mal formado o una acción inválida?**
`lecturaPeticiones.ts` revisa la forma y el dominio lanza `ErrorDeJuego` con un mensaje de `MENSAJES`.
`manejadorDeErrores.ts` responde `400`, `404` o `409` con `{ "error": "..." }`, y React muestra ese texto.

**¿Dónde se guardan las partidas? ¿Hay base de datos?**
En memoria: `RepositorioPartidasEnMemoria` usa un `Map`. Si Render reinicia, se pierden. Está aceptado y
documentado en `docs/decisiones.md`. Gracias a la interfaz `RepositorioPartidas`, cambiarlo por una base
de datos no tocaría el dominio.

**¿Por qué no usaste React Router?**
La pantalla actual es un estado de `App.tsx` (tipo `Pantalla`). Navegar es cambiar ese estado. Cumple la
restricción de no usar librerías extra y alcanza para el flujo del juego.

### Física

**¿Cómo funciona la física?**
`dominio/fisica/simulacion.ts`, `simularTiro`. Pasos fijos de 1/60 s divididos en 8 subpasos. En cada uno:
`mover` (fricción exponencial), choques por impulso (`colisiones.ts`), rebote en paredes y postes
(`movimiento.ts`), charcos y detección de gol. Cada 2 pasos guarda un cuadro (30 por segundo). Termina
cuando todo está en reposo, entra un gol o llega al tope de 20 s.

**¿Por qué la física está en el servidor y no en React?**
Para que nadie pueda hacer trampa desde el navegador y para que el resultado no dependa de la potencia de
la computadora. React solo reproduce los cuadros.

**¿Cómo se detecta un gol?**
`goles.ts`, `detectarGol`: la pelota tiene que cruzar entera la línea de gol entre los dos postes. Solo la
pelota puede pasar por la boca del arco (`rebotarEnParedes`); las tapitas rebotan.

**¿Cómo se convierte el arrastre en un tiro?**
`Cancha.tsx`, `calcularTiro`: como una resortera, la dirección es desde el puntero hacia la tapita (sale al
lado contrario). La fuerza es la distancia arrastrada dividida entre 240, con tope en 1. Si arrastras
menos de 25 unidades, no hay tiro. `enUnidadesDeCancha` pasa de píxeles a unidades de la física con la
matriz del SVG, así funciona en cualquier tamaño de ventana.

**¿Cómo se ve fluido si llegan 30 cuadros por segundo?**
`useAnimacion.ts` interpola posiciones entre dos cuadros con `requestAnimationFrame`. La pelota gira según la
distancia recorrida dividida por su radio.

### Reglas del partido

**¿Cómo se controlan los turnos?**
`registro.turno` en el servidor. `validarTiro` rechaza si no es tu turno o si la tapita no es tuya. Después de
cada tiro, `ejecutarTiro` pasa el turno con `rival(peticion.lado)`. Tras un gol, saca quien lo recibió.

**¿Cómo funciona el tiempo del turno si el servidor no tiene temporizadores?**
`tiempo.ts`, `actualizarTiempo`: en cada consulta o tiro calcula cuánto pasó desde `inicioTurno`. Si pasaron
15 s, el turno cambia de lado. `inicioTurno` se pone al final de la animación, así la animación no consume
tiempo. En el cliente, `usePartida` cuenta cada 250 ms y, al vencer, pide `GET` para sincronizar.

**¿Cómo funciona el tiro de poder?**
El cliente manda `tiroDePoder: true`. `validarTiro` revisa que queden. `ejecutarTiro` descuenta uno y
`simularEnLaPartida` multiplica la fuerza por `REGLAS.multiplicadorTiroDePoder` (1,5). Además libera la
pelota de un charco de un solo golpe (`liberaDeUnGolpe`).

**¿Cómo funciona el reloj de la Liga?**
El registro guarda `reloj: { inicio, duracionMs }`. `actualizarTiempo` finaliza cuando se cumple la duración.
`relojPublico` informa lo que queda. En pantalla, `RelojDeLiga.tsx` convierte el tiempo real en minutos y
segundos de juego (90 minutos en 300 s por defecto: 18 segundos de juego por segundo real).

**¿Cómo funciona la pausa sin perder tiempo?**
`pausa.ts`, `cambiarPausa`: guarda `pausadaDesde`. Al reanudar, corre `inicioTurno`, el inicio del reloj y los
emotes por lo que duró la pausa. Mientras está pausada, tirar, pedir turno del rival o lanzar emotes da 409
(`exigirSinPausa`). En React se detienen la animación, el rival y el audio.

**¿Cómo funcionan los emotes?**
`emotes.ts`, `lanzarEmote`: se guarda cuál y cuándo. `emoteActivo` dura 5 s y `segundosDeEsperaDelEmote`
obliga a esperar 15 s. El servidor rechaza uno antes de tiempo. `Cancha.tsx` dibuja la carita sobre las 5
tapitas.

### El perro

**¿Cómo controlas lo del perro? ¿En qué parte?**
En `server/src/dominio/reglas/tiro.ts`, dentro de `ejecutarTiro`, en la rama donde **no** hubo gol. Si el perro
está activo y apareció menos de `REGLAS.aparicionesMaximasDelPerro` veces (5), llama a `intentarAparicion`
de `dominio/eventos/perro.ts`.

**¿Cómo decide si aparece y dónde deja la pelota?**
`intentarAparicion` sortea con el azar de la partida: aparece si `azar() < probabilidad` (12 % por defecto).
`elegirDestino` busca un punto en espejo al otro lado de la cancha, con un desvío al azar de hasta 150
unidades, siempre dentro del campo y lejos de las tapitas. Por eso **nunca puede meter un gol**.
`animarPerro` arma los cuadros: entra por arriba, lleva la pelota y sale por abajo. Esos cuadros se
agregan al final del recorrido.

**¿A quién le toca después del perro?**
Al rival de quien tiró, como en cualquier tiro: el perro **nunca da doble turno**. El evento `perro` informa
`turnoPara` para que la pantalla lo anuncie. Si deja la pelota cerca de tu arco, el perro ayudó al rival.

**¿Y si la pelota estaba en un charco?**
El perro también la saca: `ejecutarTiro` pone `pelotaAtrapada = null`.

**¿Cómo se ve y suena en React?**
Los cuadros del perro traen `perro: { x, y }`. `Cancha.tsx` dibuja el sprite, `usePartida` suena el ladrido una
sola vez (`perroSonado`) y `Partida.tsx` muestra el aviso "¡El perro entró!".

**¿Dónde se activa o desactiva?**
En la pantalla, `CasillaDelPerro.tsx` (empieza desactivada). Viaja como `perroActivo` en la petición. Si un
pedido a la API no lo manda, `crearRegistro` lo deja activo.

### Charcos y estadios

**¿Qué hace cada estadio?**
`dominio/catalogo.ts` (`ESTADIOS`) define el efecto. La Paz y Oruro: charcos de agua. El Alto y Potosí: nieve.
Cochabamba y Santa Cruz: sin efecto. Los números están en `estadios/configuracionEstadios.ts`.

**¿Cómo atrapa un charco a la pelota?**
`fisica/charcos.ts`, `atraparSiEntra`: cuando el centro de la pelota entra en la elipse, la fija como si fuera
un poste (masa inversa 0). `golpearPelotaAtrapada` descuenta golpes desde el tiro siguiente. En el agua
basta 1 golpe; en la nieve, 2, o un tiro de poder.

**¿Cómo aparecen y se secan?**
`estadios/charcos.ts`: `crearCharcosIniciales` pone 2 al empezar. Después de cada tiro, `avanzarCharcos` les
resta un tiro, quita los secos (liberando la pelota) y con 40 % de probabilidad crea uno nuevo (máximo 3).

**¿Cómo suena el splash justo cuando cae?**
`simularTiro` anota en qué cuadro cayó (`caidasEnCharcos`). `contactosDeCharco` lo convierte en contacto
`charcoDeAgua` o `charcoDeNieve`, y el cliente lo suena en ese cuadro como cualquier golpe.

### El rival del servidor y la dificultad

**¿Cómo tira el servidor un buen tiro?**
`server/src/dominio/rival/rivalPorMuestreo.ts`, `decidirTiroDelRival`. No usa minimax, porque los tiros son
continuos y dependen de la física. En cambio:
1. `generarCandidatos` arma varios tiros posibles. Primero un **tiro de billar** por cada tapita propia
   (`billar.ts`, `tiroDeBillar`: golpear la pelota en el punto opuesto al arco rival, con la fuerza justa),
   ordenados por los que empujan hacia el arco y los más cercanos. Si hacen falta más, varía esos tiros al
   azar: ±0,4 rad de ángulo y ±30 % de fuerza.
2. **Simula cada candidato** con la misma física del juego (`simularEnLaPartida`), sin modificar la partida.
3. `puntuar` califica el resultado: +1000 si es gol, −1000 si es autogol, hasta +100 por llevar la pelota
   hacia el arco rival y hasta −150 si la deja cerca de su propio arco.
4. Elige el mejor y le suma un **error de puntería** al azar.

**¿Dónde se ve la dificultad?**
- En la pantalla: `opcionesDeJuego.ts` → `DIFICULTADES`, elegida en `Configuracion.tsx`.
- Viaja en `visitante.dificultad` de `PeticionCrearPartida`; `crearJugador` la guarda (por defecto `medio`).
- Su efecto: `configuracionReglas.ts` → `RIVAL.dificultades`. Fácil: 3 candidatos y error de 0,3 rad. Medio:
  12 y 0,12. Difícil: 36 y 0,04. Más candidatos es elegir mejor; menos error es ejecutar mejor.

**¿Usa el tiro de poder?**
Solo cuando le sirve de verdad: si la pelota está en la nieve con más de un golpe pendiente y le quedan tiros.

**¿Puede hacer trampa el rival?**
No: su tiro pasa por `ejecutarTiro`, con las mismas validaciones y la misma física que el de una persona.

### Temporada

**¿Cómo se arma el calendario?**
`temporada/calendario.ts`: `barajar` mezcla los equipos con la semilla y `generarCalendario` usa el método del
círculo, así cada par se enfrenta una vez. Con 10 equipos son 9 jornadas y 45 partidos.

**¿Qué pasa con los partidos donde no juega nadie?**
`avanzarTemporada` los resuelve con `simularMarcador`, sin física, cuando las personas terminan su partido de
la jornada.

**¿Cómo se actualiza la tabla?**
`calcularTabla` la calcula en cada consulta a partir de los marcadores: 3 puntos por victoria y 1 por empate,
ordenada por puntos, diferencia de goles y goles a favor. Al consultar la temporada, `sincronizar` revisa
las partidas en juego y anota las que terminaron.

**¿La temporada tiene su propio motor?**
No. Cada partido con personas es una partida de Liga común creada con `ServicioPartidas`
(`peticionParaJugar`).

### Diseño, imágenes y audio

**¿Usaste librerías de interfaz o CSS?**
No. CSS propio en `client/src/estilos/` con variables en `:root`, SVG para la cancha y componentes propios
(carrusel, modal, radios).

**¿Cómo encaja la física sobre la imagen del estadio?**
`calibracionCancha.ts`: las medidas de la imagen (líneas de gol, centro) se midieron con un script, y
`geometriaDeLaCancha` calcula la escala y el origen para que la línea de gol de la física coincida con la
dibujada.

**¿Cómo optimizaste las imágenes?**
`scripts/optimizar-recursos.mjs` con `sharp`: los PNG originales de `assets/` pasan a WebP recortados y
reducidos en `client/src/recursos/`. Vite les agrega un hash y el servidor los cachea un año.

**¿Cómo funciona el audio y por qué no suena antes de Iniciar?**
Los navegadores bloquean el audio hasta un gesto del usuario. `MotorAudio.desbloquear` crea el
`AudioContext` recién al pulsar Iniciar. El motor separa cuatro canales, recuerda volúmenes en `localStorage`
y hace sonar los golpes desde datos confirmados por el servidor, no desde cada render.

### Pruebas y despliegue

**¿Qué pruebas tienes?**
120 unitarias con `node:test` (física, reglas, perro, charcos, rival, temporada, pausa, emotes, audio) y 55
end-to-end con Playwright (inicio, interacción, API, validaciones, finalización, temporada, audio,
presentación y defensa).

**¿Cómo haces repetible una prueba si hay azar?**
Con `semilla` en la petición: `crearAzar` produce siempre la misma secuencia. Así el saque, los charcos, el
perro y el rival son iguales en cada corrida. Para forzar al perro se usa `probabilidadPerro: 1`.

**¿Cómo sabe una prueba que hay gol?**
`scripts/buscar-tiro-de-gol.ts` buscó con la física un tiro que entra desde el saque. Quedó guardado en
`GOL_DESDE_EL_SAQUE` (`e2e/ayudantes.ts`), y la prueba lo ejecuta arrastrando como una persona.

**¿Qué hace GitHub Actions?**
`.github/workflows/ci.yml`: Lint (ESLint y TypeScript), pruebas unitarias y E2E headless, y deploy a Render.
El deploy solo corre si lo anterior pasa, espera a que `/api/salud` muestre el commit nuevo y repite las E2E
contra la URL pública.

**¿Cómo demuestras que lo publicado es tu último commit?**
`GET /api/salud` devuelve `version`, que es el commit que informa Render (`RENDER_GIT_COMMIT`). Coincide con el
hash del commit en GitHub.

### Fallos controlados (para mostrar en vivo)

**Hacer fallar el lint:** declara una variable sin usar en cualquier `.ts` (por ejemplo `const prueba = 1;`) y
ejecuta `npm run lint`. Falla con `no-unused-vars`. Bórrala y vuelve a pasar.

**Mostrar una acción inválida:** en la configuración elige el mismo equipo en los dos lados y pulsa **Jugar**.
Express responde 400 y la pantalla muestra "Elijan equipos distintos: todavía no hay camisetas alternativas".

**Diagnosticar una E2E que falla:** `npx playwright show-report` abre el reporte HTML con el error, la captura y
la traza (`trace: "retain-on-failure"`). En Actions, el mismo reporte se descarga como artefacto
`reporte-e2e` o `reporte-e2e-produccion`.
