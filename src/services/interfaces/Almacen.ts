import type { Sucursal } from "./Sucursal";

export interface Almacen {
    id?: number;
    nombre: string;
    codigo: string;
    descripcion?: string | null;
    sucursal_id: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    sucursal?: Sucursal;
}
