import type { Producto } from "./Producto";
import type { Cliente } from "./Cliente";

export interface VentaMovimiento {
    almacen_id: number;
    producto_id: number;
    cantidad: number;
    precio_unitario_venta: number;
    observaciones?: string;
}

export interface VentaPayload {
    cliente_id: number;
    descuento_total?: number;
    detalle?: string;
    observaciones?: string;
    movimientos: VentaMovimiento[];
}

export interface VentaDetalle extends Producto {
    pivot?: {
        venta_id: number;
        producto_id: number;
        almacen_id: number;
        cantidad: number;
        precio_unitario_venta: string;
        observaciones?: string | null;
    };
}

export interface Venta {
    id?: number;
    codigo?: string;
    fecha?: string;
    cliente_id?: number;
    user_id?: number;
    descuento_total?: number | null;
    estado?: string;
    detalle?: string | null;
    observaciones?: string | null;
    cliente?: Cliente | null;
    user?: {
        id?: number;
        name: string;
        email?: string;
    } | null;
    almacen_producto_venta?: VentaDetalle[];
    created_at?: string | null;
    updated_at?: string | null;
}
