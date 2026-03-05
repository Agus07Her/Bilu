export interface Categoria {
    id: number
    nombre: string
}

export interface Transaccion {
    id: number
    tipo: string
    monto: any
    descripcion?: string | null
    fecha: Date | null
    userId: number
    categoria_id?: number | null
    categoria?: Categoria | null
    isOffline?: boolean
}
