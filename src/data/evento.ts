import type { Talla } from '@/types'

export interface Categoria {
  id: string
  nombre: string
  detalle: string
}

export const categorias: Categoria[] = [
  { id: 'general-damas', nombre: 'General damas', detalle: '18 a 39 años, con cronometraje' },
  { id: 'general-varones', nombre: 'General varones', detalle: '18 a 39 años, con cronometraje' },
  { id: 'juvenil', nombre: 'Juvenil', detalle: '15 a 17 años, con autorización de un tutor' },
  { id: 'master', nombre: 'Máster', detalle: '40 años en adelante' },
  { id: 'recreativa', nombre: 'Recreativa', detalle: 'Sin cronometraje, para trotar o caminar' },
]

export const tallas: Talla[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export const evento = {
  nombre: 'Draft 5K',
  distancia: '5K',
  edicion: 'Primera edición',
  fechaISO: '2026-11-15',
  fechaTexto: '15 de noviembre de 2026',
  horaLargada: '07:30',
  ciudad: 'La Paz',
  lugar: 'Parque Urbano Central, sector Kilómetro Cero',
  cierreInscripciones: '8 de noviembre de 2026',
  precioBs: 120,
  cuposTotales: 800,
  kit: [
    'Polera oficial Draft',
    'Número de corredor con chip',
    'Medalla al cruzar la meta',
    'Hidratación en ruta y en meta',
  ],
  pago: {
    entidad: 'Banco Nacional de Bolivia',
    titular: 'Draft Eventos S.R.L.',
    cuenta: '1000 2345 678',
    plazoRevision: '48 horas habiles',
  },
  contacto: {
    email: 'inscripciones@draft.bo',
    whatsapp: '+591 700 12345',
    instagram: '@draft.bo',
  },
} as const

export function nombreCategoria(id: string): string {
  return categorias.find((categoria) => categoria.id === id)?.nombre ?? 'Sin categoría'
}
