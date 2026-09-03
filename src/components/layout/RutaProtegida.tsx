import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSesion } from '@/lib/sesionAdmin'

/**
 * Puerta de entrada del panel. Hoy consulta una sesión simulada; cuando exista
 * Supabase Auth solo cambia de dónde sale `sesion`.
 */
export function RutaProtegida({ children }: { children: ReactNode }) {
  const sesion = useSesion()
  const ubicacion = useLocation()

  if (!sesion) {
    return <Navigate to="/admin/login" state={{ desde: ubicacion.pathname }} replace />
  }

  return <>{children}</>
}
