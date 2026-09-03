import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const control =
  'w-full rounded-lg border bg-white px-3.5 text-negro placeholder:text-grafito/75 transition-colors duration-150 disabled:bg-negro/5'
const normal = 'border-negro/20 hover:border-negro/40'
const conError = 'border-peligro'

interface EnvolturaProps {
  id: string
  etiqueta: string
  requerido?: boolean
  ayuda?: string
  error?: string
  children: ReactNode
  className?: string
}

function Envoltura({ id, etiqueta, requerido, ayuda, error, children, className }: EnvolturaProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-negro">
        {etiqueta}
        {requerido && (
          <span className="ml-1 text-peligro" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {ayuda && !error && (
        <p id={`${id}-ayuda`} className="text-sm text-grafito">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-peligro">
          {error}
        </p>
      )}
    </div>
  )
}

function describedBy(id: string, ayuda?: string, error?: string): string | undefined {
  if (error) return `${id}-error`
  if (ayuda) return `${id}-ayuda`
  return undefined
}

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  etiqueta: string
  ayuda?: string
  error?: string
  contenedorClassName?: string
}

export function Input({ etiqueta, ayuda, error, required, contenedorClassName, className, ...props }: InputProps) {
  const id = useId()
  return (
    <Envoltura id={id} etiqueta={etiqueta} requerido={required} ayuda={ayuda} error={error} className={contenedorClassName}>
      <input
        id={id}
        required={required}
        className={cn(control, 'h-11', error ? conError : normal, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, ayuda, error)}
        {...props}
      />
    </Envoltura>
  )
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  etiqueta: string
  ayuda?: string
  error?: string
  contenedorClassName?: string
  children: ReactNode
}

export function Select({
  etiqueta,
  ayuda,
  error,
  required,
  contenedorClassName,
  className,
  children,
  ...props
}: SelectProps) {
  const id = useId()
  return (
    <Envoltura id={id} etiqueta={etiqueta} requerido={required} ayuda={ayuda} error={error} className={contenedorClassName}>
      <select
        id={id}
        required={required}
        className={cn(control, 'h-11 select-flecha appearance-none pr-10', error ? conError : normal, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, ayuda, error)}
        {...props}
      >
        {children}
      </select>
    </Envoltura>
  )
}

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  etiqueta: string
  ayuda?: string
  error?: string
  contenedorClassName?: string
}

export function Textarea({ etiqueta, ayuda, error, required, contenedorClassName, className, ...props }: TextareaProps) {
  const id = useId()
  return (
    <Envoltura id={id} etiqueta={etiqueta} requerido={required} ayuda={ayuda} error={error} className={contenedorClassName}>
      <textarea
        id={id}
        required={required}
        rows={3}
        className={cn(control, 'py-2.5', error ? conError : normal, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, ayuda, error)}
        {...props}
      />
    </Envoltura>
  )
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  etiqueta: ReactNode
  error?: string
}

export function Checkbox({ etiqueta, error, className, ...props }: CheckboxProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className={cn(
            'mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-2 accent-amarillo',
            error ? 'border-peligro' : 'border-negro/40',
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-negro">
          {etiqueta}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-peligro">
          {error}
        </p>
      )}
    </div>
  )
}
