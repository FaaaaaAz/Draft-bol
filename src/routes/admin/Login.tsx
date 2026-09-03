import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Campos'
import { credencialesDemo, iniciarSesion, useSesion } from '@/lib/sesionAdmin'

interface EstadoUbicacion {
  desde?: string
}

export default function Login() {
  const sesion = useSesion()
  const ubicacion = useLocation()
  const navegar = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const destino = (ubicacion.state as EstadoUbicacion | null)?.desde ?? '/admin'

  if (sesion) return <Navigate to={destino} replace />

  function manejarEnvio(envio: FormEvent<HTMLFormElement>) {
    envio.preventDefault()

    if (!email.trim() || !password) {
      setError('Completa el correo y la contraseña.')
      return
    }

    const resultado = iniciarSesion(email, password)
    if (!resultado.ok) {
      setError(resultado.error ?? 'No pudimos iniciar sesión.')
      return
    }

    setError('')
    navegar(destino, { replace: true })
  }

  return (
    <div className="seccion-oscura flex min-h-screen flex-col bg-negro px-5 py-10 text-hueso">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <Link to="/" className="mb-8 inline-block self-start" aria-label="Draft, ir al sitio público">
          <Logo tamano="lg" />
        </Link>

        <div className="seccion-clara rounded-xl2 bg-white p-6 text-negro sm:p-8">
          <h1 className="font-display text-3xl uppercase leading-none tracking-wide">Panel de inscripciones</h1>
          <p className="mt-2 text-grafito">Acceso para el equipo de la agencia.</p>

          <form onSubmit={manejarEnvio} noValidate className="mt-6 grid gap-5">
            <Input
              etiqueta="Correo"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(campo) => setEmail(campo.target.value)}
            />
            <Input
              etiqueta="Contraseña"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(campo) => setPassword(campo.target.value)}
            />

            {error && (
              <p role="alert" className="rounded-lg bg-peligro-suave px-4 py-3 text-sm font-medium text-peligro-fuerte">
                {error}
              </p>
            )}

            <Button type="submit" variante="oscuro" anchoCompleto>
              Entrar
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed border-negro/20 bg-hueso p-4 text-sm text-grafito">
            <p className="font-semibold text-negro">Acceso de prueba</p>
            <p className="mt-1">
              Correo <span className="font-medium text-negro">{credencialesDemo.email}</span>, contraseña{' '}
              <span className="font-medium text-negro">{credencialesDemo.password}</span>.
            </p>
            <p className="mt-2">Todavía no hay autenticación real, la validación es solo de interfaz.</p>
          </div>
        </div>

        <Link to="/" className="enlace-subrayado mt-8 self-start text-sm text-hueso/70">
          Volver al sitio público
        </Link>
      </div>
    </div>
  )
}
