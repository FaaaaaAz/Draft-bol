import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { EstadoInscripcion } from '@/types'

interface ConfigEstado {
  texto: string
  clases: string
  icono: ReactNode
}

const reloj = (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75">
    <circle cx="8" cy="8" r="6.25" />
    <path d="M8 4.5V8l2.25 1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const check = (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const equis = (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
  </svg>
)

const estados: Record<EstadoInscripcion, ConfigEstado> = {
  pendiente: {
    texto: 'Pendiente',
    clases: 'border-amarillo bg-amarillo-tenue/70 text-negro',
    icono: reloj,
  },
  aceptado: {
    texto: 'Aceptado',
    clases: 'border-exito/30 bg-exito-suave text-exito-fuerte',
    icono: check,
  },
  rechazado: {
    texto: 'Rechazado',
    clases: 'border-peligro/25 bg-peligro-suave text-peligro-fuerte',
    icono: equis,
  },
}

interface BadgeEstadoProps {
  estado: EstadoInscripcion
  className?: string
}

/** El estado se distingue por icono, peso y color, no solo por color. */
export function BadgeEstado({ estado, className }: BadgeEstadoProps) {
  const config = estados[estado]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold',
        config.clases,
        className,
      )}
    >
      {config.icono}
      {config.texto}
    </span>
  )
}

export function textoEstado(estado: EstadoInscripcion): string {
  return estados[estado].texto
}

interface BadgeProps {
  children: ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-negro/15 bg-white px-2.5 py-1 text-sm font-medium text-grafito',
        className,
      )}
    >
      {children}
    </span>
  )
}
