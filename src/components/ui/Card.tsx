import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-xl2 border border-negro/10 bg-white p-5 shadow-[0_1px_2px_rgba(16,16,16,0.04)]', className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardTituloProps {
  children: ReactNode
  className?: string
}

export function CardTitulo({ children, className }: CardTituloProps) {
  return <h2 className={cn('font-display text-xl uppercase tracking-wide text-negro', className)}>{children}</h2>
}

interface DatoProps {
  etiqueta: string
  children: ReactNode
  className?: string
}

/** Par etiqueta / valor usado en las fichas del panel admin. */
export function Dato({ etiqueta, children, className }: DatoProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-sm text-grafito">{etiqueta}</dt>
      <dd className="mt-0.5 break-words font-medium text-negro">{children}</dd>
    </div>
  )
}
