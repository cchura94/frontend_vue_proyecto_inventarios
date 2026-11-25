import type { Rol } from './Rol';

export type { Rol };

export interface UsuarioAuth {
    id?: number;
    name: string;
    email: string;
    roles?: Rol[];
    created_at?: string | null;
    updated_at?: string | null;
}

export interface LoginResponse {
    access_token: string;
    usuario: UsuarioAuth;
    permisos: string[];
}

export interface PerfilResponse extends UsuarioAuth {
    permisos: string[];
}
