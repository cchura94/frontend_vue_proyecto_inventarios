export interface StockAlmacen {
    id?: number;
    nombre: string;
    codigo?: string | null;
    sucursal_id?: number | null;
    sucursal?: {
        id?: number;
        nombre: string;
    } | null;
    pivot?: {
        cantidad_actual: number | string;
        fecha_actualizacion?: string | null;
    };
}

export interface Producto {
    id?: number;
    nombre: string;
    descripcion?: string;
    precio_venta_actual: string;
    imagen?: string;
    estado: boolean;
    categoria_id: number;
    stock_minimo?: number;
    categoria?: {
        id?: number;
        nombre: string;
    } | null;
    almacenes?: StockAlmacen[];
    created_at?: string | null;
    updated_at?: string | null;
}
