import { useMemo } from 'react'
import { cn } from '@/lib/cn'

/**
 * QR decorativo. Dibuja un patron estable a partir del codigo de referencia,
 * asi cada inscripcion "tiene el suyo" en la demo, pero no codifica nada.
 * Se reemplaza por el QR real de pago cuando exista el backend.
 */
interface QrPlaceholderProps {
  valor: string
  className?: string
  tamano?: number
}

const MODULOS = 25
const QUIET = 2
const TOTAL = MODULOS + QUIET * 2

export function QrPlaceholder({ valor, className, tamano = 220 }: QrPlaceholderProps) {
  const celdas = useMemo(() => construirPatron(valor), [valor])

  return (
    <svg
      role="img"
      aria-label={`Código QR de ejemplo para el pago de la inscripción ${valor}`}
      viewBox={`0 0 ${TOTAL} ${TOTAL}`}
      width={tamano}
      height={tamano}
      className={cn('h-auto w-full max-w-[260px] rounded-lg bg-white', className)}
      shapeRendering="crispEdges"
    >
      <rect width={TOTAL} height={TOTAL} fill="#FFFFFF" />
      <g fill="#101010">
        {celdas.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x + QUIET} y={y + QUIET} width={1} height={1} />
        ))}
      </g>
    </svg>
  )
}

function construirPatron(semilla: string): Array<[number, number]> {
  const aleatorio = generador(hash(semilla))
  const celdas: Array<[number, number]> = []

  const esquinas = [
    [0, 0],
    [MODULOS - 7, 0],
    [0, MODULOS - 7],
  ]

  const dentroDeEsquina = (x: number, y: number) =>
    esquinas.some(([ex, ey]) => x >= ex - 1 && x <= ex + 7 && y >= ey - 1 && y <= ey + 7)

  for (const [ex, ey] of esquinas) {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const borde = x === 0 || x === 6 || y === 0 || y === 6
        const centro = x >= 2 && x <= 4 && y >= 2 && y <= 4
        if (borde || centro) celdas.push([ex + x, ey + y])
      }
    }
  }

  for (let y = 0; y < MODULOS; y += 1) {
    for (let x = 0; x < MODULOS; x += 1) {
      if (dentroDeEsquina(x, y)) continue
      if (aleatorio() > 0.55) celdas.push([x, y])
    }
  }

  return celdas
}

function hash(texto: string): number {
  let h = 2166136261
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function generador(semilla: number): () => number {
  let estado = semilla || 1
  return () => {
    estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0
    return estado / 4294967296
  }
}
