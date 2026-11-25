import api from './api';
import type { Permiso } from './interfaces/Permiso';

export interface PermisoFiltros {
    page?: number;
    limit?: number;
    search?: string;
}

export interface PermisoPayload {
    nombre: string;
    descripcion?: string | null;
}

export async function funListar(params: PermisoFiltros = {}) {
    return await api.get('/permiso', { params });
}

export async function funMostrar(id: number) {
    return await api.get(`/permiso/${id}`);
}

export async function funGuardar(datos: PermisoPayload) {
    return await api.post<{ mensaje: string; permiso: Permiso }>(
        '/permiso',
        datos,
    );
}

export async function funModificar(id: number, datos: PermisoPayload) {
    return await api.put<{ mensaje: string; permiso: Permiso }>(
        `/permiso/${id}`,
        datos,
    );
}

export async function funEliminar(id: number) {
    return await api.delete(`/permiso/${id}`);
}
