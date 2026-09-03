import { useSyncExternalStore } from 'react'

/**
 * Sesion simulada del panel admin. No hay auth real todavia: solo guarda quien
 * "entro" para que el layout y las revisiones tengan un autor. Cuando se
 * conecte Supabase Auth, este archivo se reemplaza por el cliente real y las
 * pantallas siguen usando useSesion / iniciarSesion / cerrarSesion.
 */

const CLAVE = 'draft:sesion-admin:v1'

export const credencialesDemo = {
  email: 'admin@draft.bo',
  password: 'draft2026',
}

export interface Sesion {
  email: string
  nombre: string
  desde: string
}

let sesion: Sesion | null = leerAlmacenamiento()
const oyentes = new Set<() => void>()

function leerAlmacenamiento(): Sesion | null {
  if (typeof window === 'undefined') return null
  try {
    const crudo = window.localStorage.getItem(CLAVE)
    return crudo ? (JSON.parse(crudo) as Sesion) : null
  } catch {
    return null
  }
}

function emitir(siguiente: Sesion | null): void {
  sesion = siguiente
  try {
    if (siguiente) window.localStorage.setItem(CLAVE, JSON.stringify(siguiente))
    else window.localStorage.removeItem(CLAVE)
  } catch {
    // Sin persistencia: la sesion dura lo que dure la pestaña.
  }
  oyentes.forEach((oyente) => oyente())
}

function suscribir(oyente: () => void): () => void {
  oyentes.add(oyente)
  return () => {
    oyentes.delete(oyente)
  }
}

function obtener(): Sesion | null {
  return sesion
}

export function useSesion(): Sesion | null {
  return useSyncExternalStore(suscribir, obtener, obtener)
}

export function iniciarSesion(email: string, password: string): { ok: boolean; error?: string } {
  const correo = email.trim().toLowerCase()

  if (correo !== credencialesDemo.email || password !== credencialesDemo.password) {
    return { ok: false, error: 'Correo o contraseña incorrectos.' }
  }

  emitir({ email: correo, nombre: 'Equipo Draft', desde: new Date().toISOString() })
  return { ok: true }
}

export function cerrarSesion(): void {
  emitir(null)
}
