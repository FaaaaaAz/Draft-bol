export type EstadoInscripcion = 'pendiente' | 'aceptado' | 'rechazado'

export type Genero = 'femenino' | 'masculino' | 'prefiero-no-decir'

export type Talla = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

/** Datos que llena el corredor en el formulario. */
export interface DatosInscripcion {
  nombre: string
  apellido: string
  ci: string
  fechaNacimiento: string
  genero: Genero | ''
  email: string
  telefono: string
  categoriaId: string
  talla: Talla | ''
  club: string
  emergenciaNombre: string
  emergenciaTelefono: string
  condicionMedica: string
  aceptaDeslinde: boolean
}

/** Inscripcion ya registrada. En la siguiente etapa esto es una fila de Supabase. */
export interface Inscripcion extends DatosInscripcion {
  id: string
  /** Codigo corto y unico, del tipo DRAFT-0231. Clave para cruzar el pago. */
  codigo: string
  genero: Genero
  talla: Talla
  estado: EstadoInscripcion
  creadoEn: string
  revisadoEn?: string
  revisadoPor?: string
  motivoRechazo?: string
  /** Comprobante subido por el corredor. Todavia no existe, queda en null. */
  comprobanteUrl?: string | null
}
