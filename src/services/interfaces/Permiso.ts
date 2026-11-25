import type { Rol } from './Rol';

export interface Permiso {
    id?: number;
    nombre: string;
    descripcion?: string | null;
    roles_count?: number;
    roles?: Rol[];
    created_at?: string | null;
    updated_at?: string | null;
}
