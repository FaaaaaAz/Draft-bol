import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type VarianteBoton = 'primario' | 'oscuro' | 'contorno' | 'fantasma' | 'exito' | 'peligro'
export type TamanoBoton = 'sm' | 'md' | 'lg'

const base =
  'inline-flex select-none items-center justify-center gap-2 rounded-lg font-semibold leading-none transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45'

const variantes: Record<VarianteBoton, string> = {
  primario: 'bg-amarillo text-negro hover:bg-amarillo-tenue',
  oscuro: 'bg-negro text-hueso hover:bg-grafito',
  contorno: 'border border-negro/25 bg-transparent text-negro hover:border-negro/50 hover:bg-amarillo-tenue/40',
  fantasma: 'text-grafito hover:bg-negro/5 hover:text-negro',
  exito: 'bg-exito text-white hover:bg-exito-fuerte',
  peligro: 'bg-peligro text-white hover:bg-peligro-fuerte',
}

const tamanos: Record<TamanoBoton, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-14 px-8 text-lg',
}

/** Clases del boton, para usarlas en un <Link> sin duplicar el diseño. */
export function clasesBoton(
  variante: VarianteBoton = 'primario',
  tamano: TamanoBoton = 'md',
  extra?: string,
): string {
  return cn(base, variantes[variante], tamanos[tamano], extra)
}

export interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton
  tamano?: TamanoBoton
  anchoCompleto?: boolean
}

export const Button = forwardRef<HTMLButtonElement, BotonProps>(function Button(
  { variante = 'primario', tamano = 'md', anchoCompleto = false, className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={clasesBoton(variante, tamano, cn(anchoCompleto && 'w-full', className))}
      {...props}
    />
  )
})
