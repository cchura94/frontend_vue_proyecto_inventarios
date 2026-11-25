import type { Permiso } from './Permiso';

export interface Rol {
    id?: number;
    nombre: string;
    descripcion?: string | null;
    permisos?: Permiso[];
    users_count?: number;
    created_at?: string | null;
    updated_at?: string | null;
    pivot?: Record<string, unknown>;
}
