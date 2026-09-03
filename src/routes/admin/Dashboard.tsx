import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeEstado } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { nombreCategoria } from '@/data/evento'
import { cn } from '@/lib/cn'
import { formatearFechaCorta } from '@/lib/formato'
import { contarPorEstado, restablecerDatos, useInscripciones } from '@/lib/inscripcionesStore'
import type { EstadoInscripcion, Inscripcion } from '@/types'

type Filtro = EstadoInscripcion | 'todas'

const filtros: Array<{ valor: Filtro; texto: string }> = [
  { valor: 'todas', texto: 'Todas' },
  { valor: 'pendiente', texto: 'Pendientes' },
  { valor: 'aceptado', texto: 'Aceptadas' },
  { valor: 'rechazado', texto: 'Rechazadas' },
]

export default function Dashboard() {
  const inscripciones = useInscripciones()
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todas')

  const conteo = useMemo(() => contarPorEstado(inscripciones), [inscripciones])

  const visibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return inscripciones
      .filter((inscripcion) => (filtro === 'todas' ? true : inscripcion.estado === filtro))
      .filter((inscripcion) => {
        if (!termino) return true
        const campos = [
          inscripcion.codigo,
          inscripcion.nombre,
          inscripcion.apellido,
          inscripcion.email,
          inscripcion.ci,
          inscripcion.telefono,
        ]
        return campos.some((campo) => campo.toLowerCase().includes(termino))
      })
      .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())
  }, [inscripciones, busqueda, filtro])

  function restablecer() {
    const confirmado = window.confirm('Se vuelve a los datos de ejemplo y se pierden los cambios de esta demo.')
    if (confirmado) restablecerDatos()
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase leading-none tracking-wide">Inscripciones</h1>
          <p className="mt-2 text-grafito">
            <span className="cifra font-medium text-negro">{inscripciones.length}</span> inscripciones
            registradas en total.
          </p>
        </div>
        <Button variante="contorno" tamano="sm" onClick={restablecer}>
          Restablecer datos de ejemplo
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl2 border border-negro/10 border-l-4 border-l-amarillo bg-white p-5 lg:col-span-2">
          <p className="cifra font-display text-5xl leading-none text-negro">{conteo.pendiente}</p>
          <p className="mt-2 font-semibold text-negro">Esperando revisión</p>
          <p className="mt-1 text-sm text-grafito">
            Pagos por verificar contra el extracto bancario, usando el código de referencia.
          </p>
        </div>

        <ResumenSecundario
          valor={conteo.aceptado}
          titulo="Aceptadas"
          descripcion="Cupo confirmado."
          className="border-l-4 border-l-exito/50"
        />
        <ResumenSecundario
          valor={conteo.rechazado}
          titulo="Rechazadas"
          descripcion="Pago no válido o fuera de plazo."
          className="border-l-4 border-l-peligro/40"
        />
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
          {filtros.map((item) => {
            const activo = filtro === item.valor
            const cantidad =
              item.valor === 'todas' ? inscripciones.length : conteo[item.valor as EstadoInscripcion]
            return (
              <button
                key={item.valor}
                type="button"
                aria-pressed={activo}
                onClick={() => setFiltro(item.valor)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  activo
                    ? 'border-negro bg-negro text-hueso'
                    : 'border-negro/15 bg-white text-grafito hover:border-negro/40 hover:text-negro',
                )}
              >
                {item.texto} <span className="cifra">({cantidad})</span>
              </button>
            )
          })}
        </div>

        <div className="lg:w-80">
          <label htmlFor="buscador" className="sr-only">
            Buscar inscripción
          </label>
          <input
            id="buscador"
            type="search"
            value={busqueda}
            onChange={(campo) => setBusqueda(campo.target.value)}
            placeholder="Buscar por código, nombre, carnet o correo"
            className="h-11 w-full rounded-lg border border-negro/20 bg-white px-3.5 text-negro placeholder:text-grafito/75 hover:border-negro/40"
          />
        </div>
      </div>

      {visibles.length === 0 ? (
        <p className="mt-8 rounded-xl2 border border-dashed border-negro/20 bg-white p-8 text-center text-grafito">
          No hay inscripciones que coincidan con la búsqueda.
        </p>
      ) : (
        <>
          <Tabla inscripciones={visibles} />
          <ListaMovil inscripciones={visibles} />
        </>
      )}
    </div>
  )
}

function ResumenSecundario({
  valor,
  titulo,
  descripcion,
  className,
}: {
  valor: number
  titulo: string
  descripcion: string
  className?: string
}) {
  return (
    <div className={cn('rounded-xl2 border border-negro/10 bg-white p-5', className)}>
      <p className="cifra font-display text-3xl leading-none text-grafito">{valor}</p>
      <p className="mt-2 font-medium text-negro">{titulo}</p>
      <p className="mt-1 text-sm text-grafito">{descripcion}</p>
    </div>
  )
}

function Tabla({ inscripciones }: { inscripciones: Inscripcion[] }) {
  return (
    <div className="mt-6 hidden overflow-hidden rounded-xl2 border border-negro/10 bg-white md:block">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Inscripciones registradas</caption>
        <thead>
          <tr className="border-b border-negro/10 bg-zinc-50 text-sm text-grafito">
            <th scope="col" className="px-4 py-3 font-semibold">
              Código
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Corredor
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Categoría
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Enviada
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Estado
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Revisión
            </th>
          </tr>
        </thead>
        <tbody>
          {inscripciones.map((inscripcion) => (
            <tr key={inscripcion.id} className="border-b border-negro/5 last:border-0 hover:bg-amarillo-tenue/25">
              <td className="px-4 py-3">
                <span className="cifra font-semibold text-negro">{inscripcion.codigo}</span>
              </td>
              <td className="px-4 py-3">
                <span className="block font-medium text-negro">
                  {inscripcion.nombre} {inscripcion.apellido}
                </span>
                <span className="block text-sm text-grafito">{inscripcion.email}</span>
              </td>
              <td className="px-4 py-3 text-grafito">{nombreCategoria(inscripcion.categoriaId)}</td>
              <td className="cifra px-4 py-3 text-grafito">{formatearFechaCorta(inscripcion.creadoEn)}</td>
              <td className="px-4 py-3">
                <BadgeEstado estado={inscripcion.estado} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  to={`/admin/inscripciones/${inscripcion.id}`}
                  className="rounded-lg px-3 py-2 font-semibold text-negro underline decoration-amarillo decoration-2 underline-offset-4 hover:decoration-negro"
                >
                  Ver detalle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ListaMovil({ inscripciones }: { inscripciones: Inscripcion[] }) {
  return (
    <ul className="mt-6 grid gap-3 md:hidden">
      {inscripciones.map((inscripcion) => (
        <li key={inscripcion.id}>
          <Link
            to={`/admin/inscripciones/${inscripcion.id}`}
            className="block rounded-xl2 border border-negro/10 bg-white p-4 hover:border-negro/30"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="cifra font-display text-xl text-negro">{inscripcion.codigo}</span>
              <BadgeEstado estado={inscripcion.estado} />
            </div>
            <p className="mt-2 font-medium text-negro">
              {inscripcion.nombre} {inscripcion.apellido}
            </p>
            <p className="text-sm text-grafito">{nombreCategoria(inscripcion.categoriaId)}</p>
            <p className="cifra mt-2 text-sm text-grafito">
              Enviada el {formatearFechaCorta(inscripcion.creadoEn)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
