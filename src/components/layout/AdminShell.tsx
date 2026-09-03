import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { cerrarSesion, useSesion } from '@/lib/sesionAdmin'
import { cn } from '@/lib/cn'

/**
 * Marco del panel de la agencia. Aca el amarillo baja de intensidad: fondo
 * neutro, la marca solo en el logo y los estados de revisión en verde y rojo.
 */
export function AdminShell() {
  const sesion = useSesion()
  const navegar = useNavigate()

  function salir() {
    cerrarSesion()
    navegar('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100">
      <header className="border-b border-negro/10 bg-white">
        <div className="mx-auto flex w-full max-w-contenido flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
          <Link to="/admin" className="flex items-center gap-3" aria-label="Panel Draft">
            <Logo variante="sobre-amarillo" tamano="sm" />
            <span className="hidden text-sm font-medium text-grafito sm:inline">Panel de inscripciones</span>
          </Link>

          <nav aria-label="Panel" className="order-3 w-full sm:order-none sm:w-auto">
            <ul className="flex items-center gap-1">
              <li>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    cn(
                      'inline-block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-negro text-hueso' : 'text-grafito hover:bg-negro/5 hover:text-negro',
                    )
                  }
                >
                  Inscripciones
                </NavLink>
              </li>
              <li>
                <Link
                  to="/"
                  className="inline-block rounded-lg px-3 py-2 text-sm font-medium text-grafito transition-colors hover:bg-negro/5 hover:text-negro"
                >
                  Ver el sitio público
                </Link>
              </li>
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {sesion && <span className="hidden text-sm text-grafito md:inline">{sesion.email}</span>}
            <Button variante="contorno" tamano="sm" onClick={salir}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-contenido flex-1 px-5 py-8 sm:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-negro/10 bg-white">
        <div className="mx-auto w-full max-w-contenido px-5 py-4 text-sm text-grafito sm:px-8">
          Datos de ejemplo. Las inscripciones todavía no se guardan en un servidor.
        </div>
      </footer>
    </div>
  )
}
