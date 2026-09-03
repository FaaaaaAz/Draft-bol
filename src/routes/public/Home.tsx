import { Link } from 'react-router-dom'
import { clasesBoton } from '@/components/ui/Button'
import { categorias, evento } from '@/data/evento'
import { formatearBs } from '@/lib/formato'
import { useInscripciones } from '@/lib/inscripcionesStore'

export default function Home() {
  const inscripciones = useInscripciones()
  const aceptadas = inscripciones.filter((inscripcion) => inscripcion.estado === 'aceptado').length
  const cuposDisponibles = Math.max(evento.cuposTotales - aceptadas, 0)

  return (
    <>
      <Hero cuposDisponibles={cuposDisponibles} />
      <DatosCarrera />
      <Categorias />
      <Kit />
      <Auspiciadores />
      <CierreCta />
    </>
  )
}

function Hero({ cuposDisponibles }: { cuposDisponibles: number }) {
  const franja = ['Draft 5K', 'La Paz', '15 nov 2026', 'Cupos limitados']

  return (
    <section className="seccion-oscura relative overflow-hidden bg-negro text-hueso">
      <div className="contenedor pt-12 sm:pt-16">
        <p className="hero-sube text-base text-hueso/70" style={{ animationDelay: '60ms' }}>
          {evento.ciudad}, {evento.fechaTexto}
        </p>

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <h1 className="hero-sube" style={{ animationDelay: '140ms' }}>
            <span className="sr-only">
              Draft 5K, carrera en {evento.ciudad} el {evento.fechaTexto}
            </span>
            <span
              aria-hidden="true"
              className="cifra block font-display text-[38vw] leading-[0.76] text-amarillo sm:text-[30vw] lg:text-[17rem]"
            >
              {evento.distancia}
            </span>
          </h1>

          <div className="hero-sube max-w-md" style={{ animationDelay: '220ms' }}>
            <p className="text-xl font-medium leading-snug">
              Cinco kilómetros cronometrados por el Parque Urbano Central, con salida a las{' '}
              <span className="cifra">{evento.horaLargada}</span>.
            </p>
            <p className="mt-3 text-hueso/70">
              {evento.edicion} de la carrera Draft. Los cupos son limitados y se confirman a medida que
              revisamos cada pago.
            </p>
            <Link to="/inscripcion" className={clasesBoton('primario', 'lg', 'mt-6 w-full sm:w-auto')}>
              Inscribirme
            </Link>
          </div>
        </div>
      </div>

      <div
        className="franja-entra mt-12 -mr-[8%] ml-[-8%] w-[116%] overflow-hidden bg-amarillo py-3"
        style={{ animationDelay: '260ms' }}
        aria-hidden="true"
      >
        <div className="flex items-center justify-center gap-6 whitespace-nowrap font-display text-lg uppercase tracking-wide text-negro sm:gap-10 sm:text-2xl">
          {franja.map((texto, indice) => (
            <span key={texto} className="flex items-center gap-6 sm:gap-10">
              <span className="cifra">{texto}</span>
              {indice < franja.length - 1 && <span className="h-2 w-2 rounded-full bg-negro" />}
            </span>
          ))}
        </div>
      </div>

      <div className="contenedor grid gap-4 pb-16 pt-12 sm:grid-cols-3">
        <TarjetaDato valor={String(cuposDisponibles)} etiqueta={`Cupos disponibles de ${evento.cuposTotales}`} />
        <TarjetaDato valor={String(categorias.length)} etiqueta="Categorías, con y sin cronometraje" />
        <TarjetaDato valor={formatearBs(evento.precioBs)} etiqueta="Inscripción, incluye kit del corredor" />
      </div>
    </section>
  )
}

function TarjetaDato({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div className="rounded-xl2 border border-white/15 bg-white/[0.03] p-5">
      <p className="cifra font-display text-4xl leading-none text-amarillo sm:text-5xl">{valor}</p>
      <p className="mt-3 text-sm leading-relaxed text-hueso/70">{etiqueta}</p>
    </div>
  )
}

function DatosCarrera() {
  const datos = [
    { titulo: 'Fecha', detalle: evento.fechaTexto },
    { titulo: 'Largada', detalle: `${evento.horaLargada} de la mañana` },
    { titulo: 'Punto de partida', detalle: evento.lugar },
    { titulo: 'Cierre de inscripciones', detalle: evento.cierreInscripciones },
  ]

  return (
    <section className="contenedor py-16 sm:py-20" id="carrera">
      <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">
        Lo que necesitas saber
      </h2>
      <dl className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {datos.map((dato) => (
          <div key={dato.titulo} className="border-t-2 border-negro pt-4">
            <dt className="text-sm font-semibold text-grafito">{dato.titulo}</dt>
            <dd className="mt-1 text-lg font-medium leading-snug text-negro">{dato.detalle}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Categorias() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="contenedor">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-xl font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">
            Categorías
          </h2>
          <p className="max-w-sm text-grafito">
            Todas corren la misma distancia. La categoría define contra quién compites y si tu tiempo se
            registra.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((categoria) => (
            <li
              key={categoria.id}
              className="rounded-xl2 border border-negro/10 bg-hueso p-5 transition-colors hover:border-negro/25 hover:bg-amarillo-tenue/40"
            >
              <span className="block h-1 w-10 bg-amarillo" />
              <h3 className="mt-4 font-display text-2xl uppercase tracking-wide text-negro">{categoria.nombre}</h3>
              <p className="mt-2 text-grafito">{categoria.detalle}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Kit() {
  return (
    <section className="contenedor grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
      <div>
        <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">
          Kit del corredor
        </h2>
        <p className="mt-4 max-w-md text-grafito">
          Se entrega el día anterior a la carrera, presentando el código de referencia de tu inscripción y tu
          carnet de identidad.
        </p>
      </div>

      <ul className="grid gap-3">
        {evento.kit.map((item) => (
          <li key={item} className="flex items-center gap-3 rounded-lg bg-white p-4 text-negro">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amarillo">
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="#101010" strokeWidth="2" aria-hidden="true">
                <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Auspiciadores() {
  const espacios = ['Auspiciador', 'Auspiciador', 'Auspiciador', 'Auspiciador', 'Auspiciador', 'Auspiciador']

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="contenedor">
        <h2 className="font-display text-3xl uppercase tracking-tight sm:text-4xl">Auspiciadores</h2>
        <p className="mt-3 max-w-md text-grafito">
          Espacios reservados para las marcas que acompañan esta edición.
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {espacios.map((texto, indice) => (
            <li
              key={indice}
              className="flex h-24 items-center justify-center rounded-lg border border-dashed border-negro/20 bg-hueso text-sm text-grafito"
            >
              {texto}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function CierreCta() {
  return (
    <section className="bg-amarillo">
      <div className="contenedor flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-16">
        <div>
          <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-tight text-negro sm:text-5xl">
            Nos vemos en la partida
          </h2>
          <p className="mt-3 max-w-lg text-negro/70">
            Completa el formulario, transfiere el monto de la inscripción y te confirmamos en cuanto validemos
            el pago.
          </p>
        </div>
        <Link to="/inscripcion" className={clasesBoton('oscuro', 'lg', 'w-full shrink-0 sm:w-auto')}>
          Inscribirme
        </Link>
      </div>
    </section>
  )
}
