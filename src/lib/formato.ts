const zonaHoraria = 'America/La_Paz'

export function formatearFecha(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return new Intl.DateTimeFormat('es-BO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: zonaHoraria,
  }).format(fecha)
}

export function formatearFechaCorta(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: zonaHoraria,
  }).format(fecha)
}

export function formatearFechaHora(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: zonaHoraria,
  }).format(fecha)
}

export function formatearBs(monto: number): string {
  return `Bs ${new Intl.NumberFormat('es-BO').format(monto)}`
}

export function calcularEdad(fechaNacimiento: string, referencia = new Date()): number {
  const nacimiento = new Date(fechaNacimiento)
  if (Number.isNaN(nacimiento.getTime())) return Number.NaN
  let edad = referencia.getFullYear() - nacimiento.getFullYear()
  const mes = referencia.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && referencia.getDate() < nacimiento.getDate())) edad -= 1
  return edad
}
