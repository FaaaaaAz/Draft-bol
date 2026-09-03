import { useSyncExternalStore } from 'react'
import { mockInscripciones } from '@/data/mockInscripciones'
import { generarCodigoReferencia } from '@/lib/generarCodigoReferencia'
import type { DatosInscripcion, EstadoInscripcion, Genero, Inscripcion, Talla } from '@/types'

/**
 * Store de inscripciones para esta etapa: vive en memoria y se persiste en
 * localStorage para que el flujo del panel admin se sienta real al navegar.
 * La API (crear, listar, cambiar estado) es la misma que se va a implementar
 * contra Supabase mas adelante, asi que las pantallas no cambian.
 */

const CLAVE = 'draft:inscripciones:v1'

let inscripciones: Inscripcion[] = leerAlmacenamiento()
const oyentes = new Set<() => void>()

function leerAlmacenamiento(): Inscripcion[] {
  if (typeof window === 'undefined') return mockInscripciones
  try {
    const crudo = window.localStorage.getItem(CLAVE)
    if (!crudo) return mockInscripciones
    const datos = JSON.parse(crudo) as Inscripcion[]
    return Array.isArray(datos) && datos.length > 0 ? datos : mockInscripciones
  } catch {
    return mockInscripciones
  }
}

function escribirAlmacenamiento(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(inscripciones))
  } catch {
    // Modo privado o almacenamiento lleno: el estado sigue vivo en memoria.
  }
}

function emitir(siguiente: Inscripcion[]): void {
  inscripciones = siguiente
  escribirAlmacenamiento()
  oyentes.forEach((oyente) => oyente())
}

function suscribir(oyente: () => void): () => void {
  oyentes.add(oyente)
  return () => {
    oyentes.delete(oyente)
  }
}

function obtener(): Inscripcion[] {
  return inscripciones
}

export function useInscripciones(): Inscripcion[] {
  return useSyncExternalStore(suscribir, obtener, obtener)
}

export function useInscripcionPorId(id: string | undefined): Inscripcion | undefined {
  return useInscripciones().find((inscripcion) => inscripcion.id === id)
}

export function useInscripcionPorCodigo(codigo: string | undefined): Inscripcion | undefined {
  const buscado = codigo?.trim().toUpperCase()
  return useInscripciones().find((inscripcion) => inscripcion.codigo === buscado)
}

export function crearInscripcion(datos: DatosInscripcion): Inscripcion {
  const codigo = generarCodigoReferencia(inscripciones.map((inscripcion) => inscripcion.codigo))

  const nueva: Inscripcion = {
    ...datos,
    genero: datos.genero as Genero,
    talla: datos.talla as Talla,
    id: generarId(),
    codigo,
    estado: 'pendiente',
    creadoEn: new Date().toISOString(),
    comprobanteUrl: null,
  }

  emitir([nueva, ...inscripciones])
  return nueva
}

interface OpcionesRevision {
  revisadoPor?: string
  motivoRechazo?: string
}

export function cambiarEstado(
  id: string,
  estado: EstadoInscripcion,
  opciones: OpcionesRevision = {},
): void {
  emitir(
    inscripciones.map((inscripcion) => {
      if (inscripcion.id !== id) return inscripcion

      if (estado === 'pendiente') {
        const { revisadoEn: _revisadoEn, revisadoPor: _revisadoPor, motivoRechazo: _motivo, ...resto } = inscripcion
        return { ...resto, estado }
      }

      return {
        ...inscripcion,
        estado,
        revisadoEn: new Date().toISOString(),
        revisadoPor: opciones.revisadoPor ?? 'admin@draft.bo',
        motivoRechazo: estado === 'rechazado' ? opciones.motivoRechazo?.trim() || undefined : undefined,
      }
    }),
  )
}

/** Vuelve a los datos de ejemplo. Util para demostrar el flujo mas de una vez. */
export function restablecerDatos(): void {
  emitir(mockInscripciones)
}

export function contarPorEstado(lista: Inscripcion[]): Record<EstadoInscripcion, number> {
  return lista.reduce(
    (conteo, inscripcion) => {
      conteo[inscripcion.estado] += 1
      return conteo
    },
    { pendiente: 0, aceptado: 0, rechazado: 0 } as Record<EstadoInscripcion, number>,
  )
}

function generarId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `ins-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
