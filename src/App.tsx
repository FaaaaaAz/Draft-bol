import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AdminShell } from '@/components/layout/AdminShell'
import { RutaProtegida } from '@/components/layout/RutaProtegida'
import { clasesBoton } from '@/components/ui/Button'
import Home from '@/routes/public/Home'
import Inscripcion from '@/routes/public/Inscripcion'
import Confirmacion from '@/routes/public/Confirmacion'
import Login from '@/routes/admin/Login'
import Dashboard from '@/routes/admin/Dashboard'
import DetalleInscripcion from '@/routes/admin/DetalleInscripcion'

export default function App() {
  return (
    <>
      <VolverArriba />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/inscripcion" element={<Inscripcion />} />
          <Route path="/confirmacion/:codigo" element={<Confirmacion />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <RutaProtegida>
              <AdminShell />
            </RutaProtegida>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="inscripciones/:id" element={<DetalleInscripcion />} />
        </Route>

        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </>
  )
}

function VolverArriba() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return null
}

function NoEncontrada() {
  return (
    <div className="seccion-oscura flex min-h-screen flex-col items-center justify-center gap-6 bg-negro px-6 text-center text-hueso">
      <p className="cifra font-display text-[22vw] leading-none text-amarillo sm:text-[10rem]">404</p>
      <h1 className="font-display text-3xl uppercase tracking-wide">Esta página no existe</h1>
      <p className="max-w-md text-hueso/70">
        Puede que el enlace esté mal escrito o que la página se haya movido.
      </p>
      <Link to="/" className={clasesBoton('primario', 'md')}>
        Volver al inicio
      </Link>
    </div>
  )
}
