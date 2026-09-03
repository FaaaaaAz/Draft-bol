import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QrPlaceholder } from '@/components/QrPlaceholder'
import { Button, clasesBoton } from '@/components/ui/Button'
import { BadgeEstado } from '@/components/ui/Badge'
import { evento, nombreCategoria } from '@/data/evento'
import { formatearBs, formatearFechaHora } from '@/lib/formato'
import { useInscripcionPorCodigo } from '@/lib/inscripcionesStore'

export default function Confirmacion() {
  const { codigo } = useParams<{ codigo: string }>()
  const inscripcion = useInscripcionPorCodigo(codigo)

  if (!inscripcion) {
    return (
      <div className="contenedor py-16">
        <div className="mx-auto max-w-lg rounded-xl2 border border-negro/10 bg-white p-8 text-center">
          <h1 className="font-display text-3xl uppercase tracking-wide">No encontramos esta inscripción</h1>
          <p className="mt-3 text-grafito">
            El código {codigo} no corresponde a ninguna inscripción registrada en este navegador.
          </p>
          <Link to="/inscripcion" className={clasesBoton('primario', 'md', 'mt-6')}>
            Hacer una inscripción
          </Link>
        </div>
      </div>
    )
  }

  const pasosPago = [
    'Escanea el QR desde la aplicación de tu banco o transfiere a la cuenta indicada.',
    `Escribe el código ${inscripcion.codigo} en la glosa o referencia de la transferencia.`,
    `Guarda el comprobante. Revisamos los pagos a mano, en un plazo de ${evento.pago.plazoRevision}.`,
  ]

  return (
    <div className="contenedor py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <BadgeEstado estado={inscripcion.estado} />
          <span className="text-sm text-grafito">
            Enviada el {formatearFechaHora(inscripcion.creadoEn)}
          </span>
        </div>

        <h1 className="mt-4 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">
          Recibimos tu inscripción
        </h1>
        <p className="mt-3 max-w-xl text-grafito">
          {inscripcion.nombre}, tu cupo queda reservado en cuanto confirmemos el pago. Anota este código, es
          la referencia con la que vamos a identificar tu transferencia.
        </p>

        <CodigoDestacado codigo={inscripcion.codigo} />

        <div className="mt-8 grid gap-4 sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <div className="rounded-xl2 border border-negro/10 bg-white p-5">
            <QrPlaceholder valor={inscripcion.codigo} className="mx-auto" />
            <p className="mt-4 text-center text-sm text-grafito">
              QR de ejemplo. En la versión final aparece el QR de pago del banco.
            </p>
          </div>

          <div className="rounded-xl2 border border-negro/10 bg-white p-5">
            <h2 className="font-display text-xl uppercase tracking-wide">Datos para la transferencia</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Fila etiqueta="Entidad" valor={evento.pago.entidad} />
              <Fila etiqueta="Titular" valor={evento.pago.titular} />
              <Fila etiqueta="Cuenta" valor={evento.pago.cuenta} />
              <Fila etiqueta="Glosa o referencia" valor={inscripcion.codigo} />
              <div className="flex items-baseline justify-between gap-4 border-t border-negro/10 pt-3">
                <dt className="text-grafito">Monto</dt>
                <dd className="cifra font-display text-2xl">{formatearBs(evento.precioBs)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <section className="mt-8 rounded-xl2 border border-negro/10 bg-white p-5 sm:p-7">
          <h2 className="font-display text-xl uppercase tracking-wide">Cómo completar el pago</h2>
          <ol className="mt-4 space-y-4">
            {pasosPago.map((paso, indice) => (
              <li key={paso} className="flex gap-4">
                <span className="cifra flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amarillo font-display text-lg text-negro">
                  {indice + 1}
                </span>
                <p className="pt-1 text-negro">{paso}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-negro/10 pt-4 text-sm leading-relaxed text-grafito">
            Te escribimos a {inscripcion.email} cuando la inscripción quede confirmada. Si el pago no coincide
            con el código, la revisión puede demorar más.
          </p>
        </section>

        <section className="mt-8 rounded-xl2 border border-negro/10 bg-white p-5 sm:p-7">
          <h2 className="font-display text-xl uppercase tracking-wide">Lo que registramos</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Dato etiqueta="Corredor" valor={`${inscripcion.nombre} ${inscripcion.apellido}`} />
            <Dato etiqueta="Carnet" valor={inscripcion.ci} />
            <Dato etiqueta="Categoría" valor={nombreCategoria(inscripcion.categoriaId)} />
            <Dato etiqueta="Talla de polera" valor={inscripcion.talla} />
            <Dato etiqueta="Celular" valor={inscripcion.telefono} />
            <Dato etiqueta="Contacto de emergencia" valor={`${inscripcion.emergenciaNombre}, ${inscripcion.emergenciaTelefono}`} />
          </dl>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/" className={clasesBoton('oscuro', 'md')}>
            Volver al inicio
          </Link>
          <Link to="/inscripcion" className={clasesBoton('contorno', 'md')}>
            Inscribir a otra persona
          </Link>
        </div>
      </div>
    </div>
  )
}

function CodigoDestacado({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!copiado) return
    const temporizador = window.setTimeout(() => setCopiado(false), 2200)
    return () => window.clearTimeout(temporizador)
  }, [copiado])

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div className="seccion-oscura mt-8 rounded-xl2 bg-negro p-6 text-hueso sm:p-8">
      <p className="text-sm text-hueso/70">Tu código de referencia</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <p className="cifra font-display text-5xl leading-none text-amarillo sm:text-7xl">{codigo}</p>
        <Button variante="primario" onClick={copiar} aria-live="polite">
          {copiado ? 'Código copiado' : 'Copiar código'}
        </Button>
      </div>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-hueso/70">
        Escribe este código en la glosa de la transferencia. Es lo que nos permite cruzar tu pago con tu
        inscripción sin confundirlo con el de otra persona.
      </p>
    </div>
  )
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-grafito">{etiqueta}</dt>
      <dd className="text-right font-medium">{valor}</dd>
    </div>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-sm text-grafito">{etiqueta}</dt>
      <dd className="mt-0.5 font-medium text-negro">{valor}</dd>
    </div>
  )
}
