import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BadgeEstado } from '@/components/ui/Badge'
import { Button, clasesBoton } from '@/components/ui/Button'
import { Card, CardTitulo, Dato } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Campos'
import { evento, nombreCategoria } from '@/data/evento'
import { calcularEdad, formatearBs, formatearFecha, formatearFechaHora } from '@/lib/formato'
import { cambiarEstado, useInscripcionPorId } from '@/lib/inscripcionesStore'
import { useSesion } from '@/lib/sesionAdmin'

export default function DetalleInscripcion() {
  const { id } = useParams<{ id: string }>()
  const inscripcion = useInscripcionPorId(id)
  const sesion = useSesion()
  const [rechazando, setRechazando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [errorMotivo, setErrorMotivo] = useState('')

  if (!inscripcion) {
    return (
      <div className="rounded-xl2 border border-negro/10 bg-white p-8 text-center">
        <h1 className="font-display text-2xl uppercase tracking-wide">Inscripción no encontrada</h1>
        <p className="mt-2 text-grafito">Puede que se haya restablecido la lista de datos de ejemplo.</p>
        <Link to="/admin" className={clasesBoton('oscuro', 'md', 'mt-6')}>
          Volver a inscripciones
        </Link>
      </div>
    )
  }

  const edad = calcularEdad(inscripcion.fechaNacimiento)

  function aceptar() {
    cambiarEstado(inscripcion!.id, 'aceptado', { revisadoPor: sesion?.email })
    setRechazando(false)
    setMotivo('')
  }

  function confirmarRechazo() {
    if (motivo.trim().length < 5) {
      setErrorMotivo('Escribe el motivo, queda registrado junto a la inscripción.')
      return
    }
    cambiarEstado(inscripcion!.id, 'rechazado', { revisadoPor: sesion?.email, motivoRechazo: motivo })
    setRechazando(false)
    setErrorMotivo('')
  }

  function volverAPendiente() {
    cambiarEstado(inscripcion!.id, 'pendiente')
    setMotivo('')
    setRechazando(false)
  }

  return (
    <div>
      <Link to="/admin" className="text-sm font-medium text-grafito underline underline-offset-4 hover:text-negro">
        Volver a inscripciones
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="cifra font-display text-3xl leading-none text-negro">{inscripcion.codigo}</p>
          <h1 className="mt-2 text-2xl font-semibold text-negro">
            {inscripcion.nombre} {inscripcion.apellido}
          </h1>
          <p className="mt-1 text-grafito">
            Enviada el {formatearFechaHora(inscripcion.creadoEn)}
          </p>
        </div>
        <BadgeEstado estado={inscripcion.estado} className="text-base" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="grid gap-6">
          <Card>
            <CardTitulo>Datos personales</CardTitulo>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Dato etiqueta="Nombre completo">
                {inscripcion.nombre} {inscripcion.apellido}
              </Dato>
              <Dato etiqueta="Carnet de identidad">
                <span className="cifra">{inscripcion.ci}</span>
              </Dato>
              <Dato etiqueta="Fecha de nacimiento">
                {formatearFecha(inscripcion.fechaNacimiento)}
                {!Number.isNaN(edad) && <span className="text-grafito"> ({edad} años)</span>}
              </Dato>
              <Dato etiqueta="Género">{textoGenero(inscripcion.genero)}</Dato>
              <Dato etiqueta="Correo">
                <a className="enlace-subrayado" href={`mailto:${inscripcion.email}`}>
                  {inscripcion.email}
                </a>
              </Dato>
              <Dato etiqueta="Celular">
                <span className="cifra">{inscripcion.telefono}</span>
              </Dato>
            </dl>
          </Card>

          <Card>
            <CardTitulo>Carrera</CardTitulo>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Dato etiqueta="Categoría">{nombreCategoria(inscripcion.categoriaId)}</Dato>
              <Dato etiqueta="Talla de polera">{inscripcion.talla}</Dato>
              <Dato etiqueta="Club o equipo">{inscripcion.club || 'Sin club'}</Dato>
              <Dato etiqueta="Monto de la inscripción">
                <span className="cifra">{formatearBs(evento.precioBs)}</span>
              </Dato>
            </dl>
          </Card>

          <Card>
            <CardTitulo>Emergencia y salud</CardTitulo>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Dato etiqueta="Contacto">{inscripcion.emergenciaNombre}</Dato>
              <Dato etiqueta="Celular del contacto">
                <span className="cifra">{inscripcion.emergenciaTelefono}</span>
              </Dato>
              <Dato etiqueta="Condición médica" className="sm:col-span-2">
                {inscripcion.condicionMedica || 'No declara ninguna'}
              </Dato>
              <Dato etiqueta="Deslinde de responsabilidad" className="sm:col-span-2">
                {inscripcion.aceptaDeslinde ? 'Aceptado al enviar el formulario' : 'No aceptado'}
              </Dato>
            </dl>
          </Card>
        </div>

        <aside className="grid gap-6 lg:sticky lg:top-24">
          <Card>
            <CardTitulo>Comprobante de pago</CardTitulo>
            <div className="mt-4 flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-negro/25 bg-zinc-50 p-6 text-center">
              <svg viewBox="0 0 24 24" className="h-10 w-10 text-grafito" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21z" strokeLinejoin="round" />
                <path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" />
              </svg>
              <p className="text-sm text-grafito">
                El corredor todavía no puede subir su comprobante. Este espacio queda listo para la imagen
                cuando se conecte el backend.
              </p>
            </div>
            <p className="mt-4 text-sm text-grafito">
              Verifica que el depósito lleve la glosa <span className="cifra font-semibold text-negro">{inscripcion.codigo}</span> y
              el monto de {formatearBs(evento.precioBs)}.
            </p>
          </Card>

          <Card>
            <CardTitulo>Revisión</CardTitulo>

            {inscripcion.estado === 'pendiente' && !rechazando && (
              <>
                <p className="mt-3 text-sm text-grafito">
                  Confirma el cupo solo si el pago aparece en el extracto con este código de referencia.
                </p>
                <div className="mt-4 grid gap-3">
                  <Button variante="exito" anchoCompleto onClick={aceptar}>
                    Aceptar inscripción
                  </Button>
                  <Button variante="peligro" anchoCompleto onClick={() => setRechazando(true)}>
                    Rechazar
                  </Button>
                </div>
              </>
            )}

            {rechazando && (
              <div className="mt-4 grid gap-4">
                <Textarea
                  etiqueta="Motivo del rechazo"
                  required
                  value={motivo}
                  error={errorMotivo}
                  ayuda="Queda guardado en la inscripción para poder responderle al corredor."
                  onChange={(campo) => {
                    setMotivo(campo.target.value)
                    if (errorMotivo) setErrorMotivo('')
                  }}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variante="peligro" onClick={confirmarRechazo}>
                    Confirmar rechazo
                  </Button>
                  <Button
                    variante="contorno"
                    onClick={() => {
                      setRechazando(false)
                      setErrorMotivo('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {inscripcion.estado !== 'pendiente' && !rechazando && (
              <div className="mt-3 grid gap-4">
                <p className="text-sm leading-relaxed text-grafito">
                  {inscripcion.estado === 'aceptado' ? 'Aceptada' : 'Rechazada'} el{' '}
                  {inscripcion.revisadoEn ? formatearFechaHora(inscripcion.revisadoEn) : 'sin fecha'}
                  {inscripcion.revisadoPor ? `, por ${inscripcion.revisadoPor}` : ''}.
                </p>

                {inscripcion.motivoRechazo && (
                  <p className="rounded-lg bg-peligro-suave px-4 py-3 text-sm text-peligro-fuerte">
                    {inscripcion.motivoRechazo}
                  </p>
                )}

                <Button variante="contorno" anchoCompleto onClick={volverAPendiente}>
                  Devolver a pendiente
                </Button>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  )
}

function textoGenero(genero: string): string {
  if (genero === 'femenino') return 'Femenino'
  if (genero === 'masculino') return 'Masculino'
  return 'Prefiere no decirlo'
}
