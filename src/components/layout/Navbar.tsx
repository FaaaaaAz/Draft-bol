import { Link, NavLink } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { clasesBoton } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

const enlaces = [
  { a: '/', texto: 'Inicio' },
  { a: '/inscripcion', texto: 'Inscripción' },
]

export function Navbar() {
  return (
    <header className="seccion-oscura sticky top-0 z-40 border-b border-white/10 bg-negro text-hueso">
      <nav className="contenedor flex h-16 items-center justify-between gap-4" aria-label="Principal">
        <Link to="/" className="rounded-sm" aria-label="Draft, ir al inicio">
          <Logo tamano="md" />
        </Link>

        <div className="flex items-center gap-1 sm:gap-4">
          <ul className="hidden items-center gap-1 sm:flex">
            {enlaces.map((enlace) => (
              <li key={enlace.a}>
                <NavLink
                  to={enlace.a}
                  end={enlace.a === '/'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2 text-[0.95rem] font-medium transition-colors',
                      isActive ? 'text-amarillo' : 'text-hueso/80 hover:text-hueso',
                    )
                  }
                >
                  {enlace.texto}
                </NavLink>
              </li>
            ))}
          </ul>

          <Link to="/inscripcion" className={clasesBoton('primario', 'sm', 'px-4')}>
            Inscribirme
          </Link>
        </div>
      </nav>
    </header>
  )
}
