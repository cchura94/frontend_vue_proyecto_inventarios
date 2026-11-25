import type { Rol } from './Rol';

export interface Usuario {
    id?: number;
    name: string;
    email: string;
    password?: string;
    roles?: Rol[];
    created_at?: string | null;
    updated_at?: string | null;
}

/**
 * Payload que espera el backend: los roles se envían como ids.
 */
export interface UsuarioPayload {
    name: string;
    email: string;
    password?: string;
    roles?: number[];
}
