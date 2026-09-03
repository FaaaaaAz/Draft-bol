import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { evento } from '@/data/evento'

export function Footer() {
  return (
    <footer className="seccion-oscura bg-negro text-hueso">
      <div className="contenedor grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo variante="sobre-amarillo" tamano="lg" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-hueso/70">
            Agencia de eventos deportivos en Bolivia. Organizamos carreras, torneos y activaciones de marca.
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg uppercase tracking-wide text-amarillo">La carrera</h2>
          <ul className="mt-4 space-y-2 text-sm text-hueso/80">
            <li>{evento.nombre}</li>
            <li>{evento.fechaTexto}</li>
            <li>{evento.lugar}</li>
            <li>Largada {evento.horaLargada}</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg uppercase tracking-wide text-amarillo">Contacto</h2>
          <ul className="mt-4 space-y-2 text-sm text-hueso/80">
            <li>
              <a className="enlace-subrayado" href={`mailto:${evento.contacto.email}`}>
                {evento.contacto.email}
              </a>
            </li>
            <li>WhatsApp {evento.contacto.whatsapp}</li>
            <li>{evento.contacto.instagram}</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg uppercase tracking-wide text-amarillo">Organización</h2>
          <ul className="mt-4 space-y-2 text-sm text-hueso/80">
            <li>
              <Link className="enlace-subrayado" to="/inscripcion">
                Inscribirme
              </Link>
            </li>
            <li>
              <Link className="enlace-subrayado" to="/admin">
                Panel de la agencia
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="contenedor flex flex-col gap-2 py-6 text-sm text-hueso/60 sm:flex-row sm:items-center sm:justify-between">
          <p>Draft {new Date().getFullYear()}. Todos los derechos reservados.</p>
          <p>Sitio de inscripciones, versión de demostración con datos de ejemplo.</p>
        </div>
      </div>
    </footer>
  )
}
