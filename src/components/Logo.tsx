import { cn } from '@/lib/cn'

export type VarianteLogo = 'sobre-negro' | 'sobre-amarillo' | 'plano'
export type TamanoLogo = 'sm' | 'md' | 'lg'

const tamanos: Record<TamanoLogo, string> = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
}

const relleno: Record<TamanoLogo, string> = {
  sm: 'px-1.5 py-0.5',
  md: 'px-2 py-0.5',
  lg: 'px-3 py-1',
}

interface LogoProps {
  variante?: VarianteLogo
  tamano?: TamanoLogo
  className?: string
}

/**
 * Logo de texto de la marca. Vive aislado a proposito: el dia que exista el
 * logo definitivo se reemplaza el contenido de este componente y nada mas.
 */
export function Logo({ variante = 'sobre-negro', tamano = 'md', className }: LogoProps) {
  const esBloque = variante === 'sobre-amarillo'

  return (
    <span
      className={cn(
        'inline-block font-display uppercase leading-none tracking-[0.02em]',
        tamanos[tamano],
        variante === 'sobre-negro' && 'text-amarillo',
        variante === 'plano' && 'text-negro',
        esBloque && cn('bg-amarillo text-negro', relleno[tamano]),
        className,
      )}
    >
      Draft
    </span>
  )
}
