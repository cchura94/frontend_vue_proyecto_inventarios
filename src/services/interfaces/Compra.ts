import type { Producto } from "./Producto";
import type { Proveedor } from "./Proveedor";

export interface CompraMovimiento {
    almacen_id: number;
    producto_id: number;
    cantidad: number;
    precio_unitario_compra: number;
    observaciones?: string;
}

export interface CompraPayload {
    proveedor_id: number;
    descuento_total?: number;
    detalle?: string;
    observaciones?: string;
    movimientos: CompraMovimiento[];
}

export interface CompraDetalle extends Producto {
    pivot?: {
        compra_id: number;
        producto_id: number;
        almacen_id: number;
        cantidad: number;
        precio_unitario_compra: string;
        observaciones?: string | null;
    };
}

export interface Compra {
    id?: number;
    codigo?: string;
    fecha?: string;
    proveedor_id?: number;
    user_id?: number;
    descuento_total?: number | null;
    estado?: string;
    detalle?: string | null;
    observaciones?: string | null;
    proveedor?: Proveedor | null;
    user?: {
        id?: number;
        name: string;
        email?: string;
    } | null;
    almacen_producto_compra?: CompraDetalle[];
    created_at?: string | null;
    updated_at?: string | null;
}
