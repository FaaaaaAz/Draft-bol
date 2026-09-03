import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Campos'
import { categorias, evento, tallas } from '@/data/evento'
import { cn } from '@/lib/cn'
import { calcularEdad, formatearBs } from '@/lib/formato'
import { crearInscripcion } from '@/lib/inscripcionesStore'
import type { DatosInscripcion, Genero, Talla } from '@/types'

type Errores = Partial<Record<keyof DatosInscripcion, string>>

const pasos = [
  { numero: 1, titulo: 'Datos personales' },
  { numero: 2, titulo: 'Carrera y talla' },
  { numero: 3, titulo: 'Emergencia y deslinde' },
]

const valoresIniciales: DatosInscripcion = {
  nombre: '',
  apellido: '',
  ci: '',
  fechaNacimiento: '',
  genero: '',
  email: '',
  telefono: '',
  categoriaId: '',
  talla: '',
  club: '',
  emergenciaNombre: '',
  emergenciaTelefono: '',
  condicionMedica: '',
  aceptaDeslinde: false,
}

const obligatorio = 'Este dato es obligatorio.'

function validarPaso(paso: number, datos: DatosInscripcion): Errores {
  const errores: Errores = {}

  if (paso === 1) {
    if (datos.nombre.trim().length < 2) errores.nombre = 'Escribe tu nombre completo.'
    if (datos.apellido.trim().length < 2) errores.apellido = 'Escribe tus apellidos.'
    if (!/^\d{5,10}$/.test(datos.ci.trim())) errores.ci = 'El carnet debe tener entre 5 y 10 dígitos, sin puntos.'

    if (!datos.fechaNacimiento) {
      errores.fechaNacimiento = obligatorio
    } else {
      const edad = calcularEdad(datos.fechaNacimiento)
      if (Number.isNaN(edad)) errores.fechaNacimiento = 'La fecha no es válida.'
      else if (edad < 15) errores.fechaNacimiento = 'La edad mínima para participar es 15 años.'
      else if (edad > 99) errores.fechaNacimiento = 'Revisa el año de nacimiento.'
    }

    if (!datos.genero) errores.genero = obligatorio
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(datos.email.trim())) errores.email = 'Escribe un correo válido.'
    if (!/^\d{8}$/.test(datos.telefono.trim())) errores.telefono = 'El celular debe tener 8 dígitos.'
  }

  if (paso === 2) {
    if (!datos.categoriaId) errores.categoriaId = 'Elige una categoría.'
    if (!datos.talla) errores.talla = 'Elige una talla.'
  }

  if (paso === 3) {
    if (datos.emergenciaNombre.trim().length < 2) errores.emergenciaNombre = obligatorio
    if (!/^\d{8}$/.test(datos.emergenciaTelefono.trim()))
      errores.emergenciaTelefono = 'El celular debe tener 8 dígitos.'
    if (!datos.aceptaDeslinde) errores.aceptaDeslinde = 'Necesitamos tu aceptación para inscribirte.'
  }

  return errores
}

export default function Inscripcion() {
  const [paso, setPaso] = useState(1)
  const [datos, setDatos] = useState<DatosInscripcion>(valoresIniciales)
  const [errores, setErrores] = useState<Errores>({})
  const [enviando, setEnviando] = useState(false)
  const encabezado = useRef<HTMLHeadingElement>(null)
  const navegar = useNavigate()

  function actualizar<C extends keyof DatosInscripcion>(campo: C, valor: DatosInscripcion[C]) {
    setDatos((previo) => ({ ...previo, [campo]: valor }))
    setErrores((previo) => {
      if (!previo[campo]) return previo
      const copia = { ...previo }
      delete copia[campo]
      return copia
    })
  }

  function irAPaso(siguiente: number) {
    setPaso(siguiente)
    window.requestAnimationFrame(() => encabezado.current?.focus())
  }

  function manejarEnvio(envio: FormEvent<HTMLFormElement>) {
    envio.preventDefault()

    const encontrados = validarPaso(paso, datos)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    if (paso < pasos.length) {
      irAPaso(paso + 1)
      return
    }

    setEnviando(true)
    const inscripcion = crearInscripcion(datos)
    navegar(`/confirmacion/${inscripcion.codigo}`, { replace: true })
  }

  const pasoActual = pasos[paso - 1]

  return (
    <div className="contenedor grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
      <div>
        <h1 className="font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">
          Inscripción a la {evento.nombre}
        </h1>
        <p className="mt-3 max-w-xl text-grafito">
          Son tres pasos cortos. Al terminar recibes tu código de referencia para hacer la transferencia.
        </p>

        <ol className="mt-8 grid gap-3 sm:grid-cols-3">
          {pasos.map((item) => {
            const completado = item.numero < paso
            const activo = item.numero === paso
            return (
              <li
                key={item.numero}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3',
                  activo && 'border-negro bg-white',
                  completado && 'border-negro/15 bg-white',
                  !activo && !completado && 'border-negro/10 bg-transparent',
                )}
                aria-current={activo ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'cifra flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-lg',
                    activo || completado ? 'bg-amarillo text-negro' : 'bg-negro/10 text-grafito',
                  )}
                >
                  {item.numero}
                </span>
                <span className={cn('text-sm font-medium', activo ? 'text-negro' : 'text-grafito')}>
                  {item.titulo}
                </span>
              </li>
            )
          })}
        </ol>

        <form onSubmit={manejarEnvio} noValidate className="mt-8 rounded-xl2 border border-negro/10 bg-white p-5 sm:p-7">
          <h2 ref={encabezado} tabIndex={-1} className="font-display text-2xl uppercase tracking-wide outline-none">
            Paso {paso} de {pasos.length}, {pasoActual.titulo}
          </h2>

          {paso === 1 && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Input
                etiqueta="Nombre"
                required
                autoComplete="given-name"
                value={datos.nombre}
                error={errores.nombre}
                onChange={(campo) => actualizar('nombre', campo.target.value)}
              />
              <Input
                etiqueta="Apellidos"
                required
                autoComplete="family-name"
                value={datos.apellido}
                error={errores.apellido}
                onChange={(campo) => actualizar('apellido', campo.target.value)}
              />
              <Input
                etiqueta="Carnet de identidad"
                required
                inputMode="numeric"
                ayuda="Solo números, sin puntos ni extensión."
                value={datos.ci}
                error={errores.ci}
                onChange={(campo) => actualizar('ci', campo.target.value)}
              />
              <Input
                etiqueta="Fecha de nacimiento"
                required
                type="date"
                value={datos.fechaNacimiento}
                error={errores.fechaNacimiento}
                onChange={(campo) => actualizar('fechaNacimiento', campo.target.value)}
              />
              <Select
                etiqueta="Género"
                required
                value={datos.genero}
                error={errores.genero}
                onChange={(campo) => actualizar('genero', campo.target.value as Genero)}
              >
                <option value="">Elegir</option>
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="prefiero-no-decir">Prefiero no decirlo</option>
              </Select>
              <Input
                etiqueta="Correo electrónico"
                required
                type="email"
                autoComplete="email"
                value={datos.email}
                error={errores.email}
                onChange={(campo) => actualizar('email', campo.target.value)}
              />
              <Input
                etiqueta="Celular"
                required
                inputMode="numeric"
                autoComplete="tel"
                ayuda="8 dígitos, sin el código de país."
                value={datos.telefono}
                error={errores.telefono}
                onChange={(campo) => actualizar('telefono', campo.target.value)}
              />
            </div>
          )}

          {paso === 2 && (
            <div className="mt-6 grid gap-5">
              <fieldset>
                <legend className="text-sm font-medium text-negro">
                  Categoría <span className="text-peligro">*</span>
                </legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {categorias.map((categoria) => {
                    const elegida = datos.categoriaId === categoria.id
                    return (
                      <label
                        key={categoria.id}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
                          elegida
                            ? 'border-negro bg-amarillo-tenue/50'
                            : 'border-negro/20 bg-white hover:border-negro/40',
                        )}
                      >
                        <input
                          type="radio"
                          name="categoria"
                          className="mt-1 h-4 w-4 accent-amarillo"
                          value={categoria.id}
                          checked={elegida}
                          onChange={() => actualizar('categoriaId', categoria.id)}
                        />
                        <span>
                          <span className="block font-semibold text-negro">{categoria.nombre}</span>
                          <span className="mt-0.5 block text-sm text-grafito">{categoria.detalle}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
                {errores.categoriaId && (
                  <p className="mt-2 text-sm font-medium text-peligro">{errores.categoriaId}</p>
                )}
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <Select
                  etiqueta="Talla de polera"
                  required
                  value={datos.talla}
                  error={errores.talla}
                  onChange={(campo) => actualizar('talla', campo.target.value as Talla)}
                >
                  <option value="">Elegir</option>
                  {tallas.map((talla) => (
                    <option key={talla} value={talla}>
                      {talla}
                    </option>
                  ))}
                </Select>
                <Input
                  etiqueta="Club o equipo"
                  ayuda="Opcional, si corres con un grupo."
                  value={datos.club}
                  onChange={(campo) => actualizar('club', campo.target.value)}
                />
              </div>
            </div>
          )}

          {paso === 3 && (
            <div className="mt-6 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  etiqueta="Nombre del contacto de emergencia"
                  required
                  value={datos.emergenciaNombre}
                  error={errores.emergenciaNombre}
                  onChange={(campo) => actualizar('emergenciaNombre', campo.target.value)}
                />
                <Input
                  etiqueta="Celular del contacto"
                  required
                  inputMode="numeric"
                  value={datos.emergenciaTelefono}
                  error={errores.emergenciaTelefono}
                  onChange={(campo) => actualizar('emergenciaTelefono', campo.target.value)}
                />
              </div>

              <Textarea
                etiqueta="Condición médica o alergia"
                ayuda="Opcional. Solo lo ve el equipo médico de la carrera."
                value={datos.condicionMedica}
                onChange={(campo) => actualizar('condicionMedica', campo.target.value)}
              />

              <div className="rounded-lg border border-negro/15 bg-hueso p-4">
                <h3 className="font-semibold text-negro">Deslinde de responsabilidad</h3>
                <div className="mt-2 max-h-40 overflow-y-auto pr-2 text-sm leading-relaxed text-grafito">
                  <p>
                    Declaro que participo por voluntad propia y que me encuentro en condiciones físicas
                    adecuadas para completar la distancia de {evento.distancia}. Asumo los riesgos propios de una
                    carrera de calle y libero a Draft Eventos, a sus auspiciadores y al personal de la
                    organización de toda responsabilidad por lesiones, daños o pérdidas que pudieran ocurrir
                    antes, durante o después del evento.
                  </p>
                  <p className="mt-3">
                    Autorizo a la organización a brindarme atención médica de emergencia si fuera necesario, y
                    al uso de fotografías y videos donde aparezca, con fines de difusión del evento. Confirmo
                    que los datos entregados son verdaderos y entiendo que la inscripción se confirma recién
                    cuando la organización valida el pago.
                  </p>
                </div>
                <div className="mt-4">
                  <Checkbox
                    etiqueta="Leí y acepto el deslinde de responsabilidad."
                    checked={datos.aceptaDeslinde}
                    error={errores.aceptaDeslinde}
                    onChange={(campo) => actualizar('aceptaDeslinde', campo.target.checked)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-negro/10 pt-6 sm:flex-row sm:justify-between">
            <Button
              variante="contorno"
              onClick={() => irAPaso(paso - 1)}
              disabled={paso === 1 || enviando}
              className={cn(paso === 1 && 'invisible sm:visible')}
            >
              Volver
            </Button>
            <Button type="submit" variante={paso === pasos.length ? 'oscuro' : 'primario'} disabled={enviando}>
              {paso === pasos.length ? 'Enviar inscripción' : 'Continuar'}
            </Button>
          </div>
        </form>
      </div>

      <aside className="rounded-xl2 border border-negro/10 bg-white p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-xl uppercase tracking-wide">Tu inscripción</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-grafito">Carrera</dt>
            <dd className="font-medium">{evento.nombre}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-grafito">Fecha</dt>
            <dd className="font-medium">{evento.fechaTexto}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-negro/10 pt-3">
            <dt className="text-grafito">Total a pagar</dt>
            <dd className="cifra font-display text-2xl text-negro">{formatearBs(evento.precioBs)}</dd>
          </div>
        </dl>
        <p className="mt-4 border-t border-negro/10 pt-4 text-sm leading-relaxed text-grafito">
          El pago se hace por transferencia después de enviar el formulario. La organización revisa cada
          comprobante a mano, en un plazo de {evento.pago.plazoRevision}.
        </p>
      </aside>
    </div>
  )
}
