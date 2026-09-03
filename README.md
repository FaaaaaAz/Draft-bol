# Draft, frontend de inscripciones

Sitio de inscripciones para las carreras de Draft. Esta etapa es **solo frontend**:
todo el flujo se navega de punta a punta con datos de ejemplo, sin backend, sin
API y sin autenticación real. Está preparado para conectarse a Supabase en la
siguiente etapa sin rehacer pantallas.

## Cómo correrlo

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # typecheck + build de producción
npm run preview    # sirve el build
npm run typecheck  # solo TypeScript
```

## Stack

Vite, React 18, TypeScript, Tailwind CSS y React Router. Fuentes desde Google
Fonts: Anton para display y Work Sans para cuerpo e interfaz.

## Las dos entradas

Un solo proyecto con dos grupos de rutas, para compartir el sistema de diseño
sin duplicar configuración. Se pueden separar en dos deploys más adelante sin
tocar el código.

| Ruta | Pantalla |
| --- | --- |
| `/` | Landing del evento |
| `/inscripcion` | Formulario en tres pasos |
| `/confirmacion/:codigo` | QR de ejemplo y código de referencia |
| `/admin/login` | Login simulado |
| `/admin` | Listado de inscripciones, buscador y filtro por estado |
| `/admin/inscripciones/:id` | Detalle del corredor, aceptar o rechazar |

Acceso de prueba del panel: `admin@draft.bo` con la contraseña `draft2026`.
Está escrito en pantalla y validado solo en el cliente.

## Estructura

```
src/
  routes/public/    Home, Inscripcion, Confirmacion
  routes/admin/     Login, Dashboard, DetalleInscripcion
  components/ui/    Button, Badge, Card, Campos (Input, Select, Textarea, Checkbox)
  components/layout/ Navbar, Footer, PublicLayout, AdminShell, RutaProtegida
  components/       Logo, QrPlaceholder
  data/             evento.ts (datos de la carrera), mockInscripciones.ts
  lib/              generarCodigoReferencia, inscripcionesStore, sesionAdmin, formato, cn
  styles/index.css  Base, utilidades y la animación del hero
```

## Estado y datos

`src/lib/inscripcionesStore.ts` mantiene las inscripciones en memoria y las
persiste en `localStorage` para que el panel se sienta funcional mientras se
navega. Expone la misma API que va a tener la versión con Supabase:
`useInscripciones`, `crearInscripcion`, `cambiarEstado`. El botón
"Restablecer datos de ejemplo" del dashboard vuelve al mock original.

`src/lib/sesionAdmin.ts` hace lo mismo con la sesión del panel. Cuando exista
Supabase Auth, solo cambia de dónde sale la sesión: `RutaProtegida` y
`AdminShell` no se tocan.

## Código de referencia

Cada inscripción genera un código corto del tipo `DRAFT-0231`
(`src/lib/generarCodigoReferencia.ts`). Aparece en grande en la confirmación,
como glosa sugerida de la transferencia, y junto a cada fila del dashboard para
cruzarlo con el extracto bancario. Cuando esto viva en Supabase, esa columna
lleva un índice único.

## Identidad

| Color | Uso |
| --- | --- |
| `negro` `#101010` | Fondo principal, texto sobre amarillo |
| `amarillo` `#F4C500` | CTAs, cifras grandes, detalles de marca |
| `hueso` `#F7F5EF` | Texto sobre negro, fondos claros |
| `grafito` `#4A4A46` | Texto secundario, bordes |
| `amarillo-tenue` `#FBEAB0` | Hover y estados suaves |

El amarillo es acento, nunca fondo de página completa. El panel admin baja su
protagonismo: fondo neutro y verde o rojo semántico para los estados de
revisión, donde la claridad manda sobre la marca.

El logo es texto por ahora y vive aislado en `src/components/Logo.tsx`, con tres
variantes (sobre negro, sobre amarillo, plano). Reemplazarlo por el logo real es
cambiar ese archivo y nada más.

Hay un solo momento de animación en todo el sitio: la entrada del hero, donde la
franja amarilla se desliza y el bloque de texto sube con ella. Respeta
`prefers-reduced-motion`.

## Qué falta para la siguiente etapa

- Tablas y políticas en Supabase, reemplazando `mockInscripciones`
- Autenticación real del panel
- Subida del comprobante de pago, con el espacio ya reservado en el detalle
- QR de pago real, hoy es un patrón decorativo generado desde el código
- Envío de correos de confirmación
