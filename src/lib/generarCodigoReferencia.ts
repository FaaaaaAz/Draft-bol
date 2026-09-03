const PREFIJO = 'DRAFT'

/**
 * Genera el codigo de referencia que el corredor anota como glosa de la
 * transferencia y que el admin cruza contra el extracto bancario.
 * Formato: DRAFT-0231.
 *
 * Recibe los codigos ya usados para evitar colisiones. Cuando esto viva en
 * Supabase, la unicidad la garantiza un indice unique sobre la columna.
 */
export function generarCodigoReferencia(codigosExistentes: Iterable<string> = []): string {
  const usados = new Set(codigosExistentes)

  for (let intento = 0; intento < 200; intento += 1) {
    const codigo = `${PREFIJO}-${aleatorio(1, 9999)}`
    if (!usados.has(codigo)) return codigo
  }

  // Salida deterministica si el rango corto se saturara.
  let siguiente = usados.size + 1
  while (usados.has(`${PREFIJO}-${formatear(siguiente)}`)) siguiente += 1
  return `${PREFIJO}-${formatear(siguiente)}`
}

export function esCodigoValido(codigo: string): boolean {
  return /^DRAFT-\d{4}$/.test(codigo.trim().toUpperCase())
}

function aleatorio(min: number, max: number): string {
  return formatear(Math.floor(Math.random() * (max - min + 1)) + min)
}

function formatear(n: number): string {
  return String(n).padStart(4, '0')
}
