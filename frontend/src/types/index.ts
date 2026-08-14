export type Rol = 'voluntario' | 'administrador'
export type EstadoDonacion = 'pendiente' | 'listo' | 'en_transito' | 'entregado'
export type EstadoEnvio = 'en_transito' | 'entregado'
export type TipoTransporte = 'carro' | 'camion' | 'avion_vuelo' | 'barco' | 'otro'

export interface CategoriasKits {
  aseo:         number
  alimentos:    number
  mascotas:     number
  medicamentos: number
  insumos:      number
  rescate:      number
  refugio:      number
  ropa:         number
}

export interface Voluntario {
  id:        string
  nombre:    string
  documento: string
  rol:       Rol
}

export interface SessionData extends Voluntario {
  token: string
}

export interface Donacion {
  id:                 string
  codigo:             string
  acopio:             string
  responsable_id:     string
  responsable_nombre: string
  fecha_hora:         string
  destino?:           string
  comentarios?:       string
  categorias:         CategoriasKits
  total_cajas:        number
  estado:             EstadoDonacion
  created_at:         string
  updated_at:         string
}

export interface Envio {
  id:                 string
  codigo:             string
  tipo_transporte:    TipoTransporte
  capacidad_ton?:     number
  empresa?:           string
  placa?:             string
  responsable_nombre: string
  contacto?:          string
  fecha_hora:         string
  ciudad_origen:      string
  ciudad_destino:     string
  donaciones_ids:     string[]
  carga_categorias:   CategoriasKits
  total_cajas:        number
  estado:             EstadoEnvio
  creado_por_id?:     string
  creado_por_nombre?: string
  created_at:         string
  updated_at:         string
}

export interface Recepcion {
  id:                  string
  codigo:              string
  receptor_nombre:     string
  envio_id:            string
  envio_codigo:        string
  carga_categorias?:   CategoriasKits
  total_cajas?:        number
  tipo_transporte?:    TipoTransporte
  capacidad_ton?:      number
  empresa?:            string
  responsable_nombre?: string
  contacto?:           string
  placa?:              string
  fecha_hora:          string
  ciudad_origen?:      string
  ciudad_destino?:     string
  creado_por_id?:      string
  creado_por_nombre?:  string
  created_at:          string
}

export interface PaginationParams {
  page?:  number
  limit?: number
}

export interface ApiError {
  detail: string
  code?:  string
  status: number
}
