import api from './api';
import type { Rol } from './interfaces/Rol';

export interface RolFiltros {
    page?: number;
    limit?: number;
    search?: string;
}

export interface RolPayload {
    nombre: string;
    descripcion?: string | null;
    permisos?: number[];
}

export async function funListar(params: RolFiltros = {}) {
    return await api.get('/rol', { params });
}

export async function funMostrar(id: number) {
    return await api.get(`/rol/${id}`);
}

export async function funGuardar(datos: RolPayload) {
    return await api.post<{ mensaje: string; rol: Rol }>('/rol', datos);
}

export async function funModificar(id: number, datos: RolPayload) {
    return await api.put<{ mensaje: string; rol: Rol }>(`/rol/${id}`, datos);
}

export async function funEliminar(id: number) {
    return await api.delete(`/rol/${id}`);
}

export async function funActualizarPermisos(id: number, permisos: number[]) {
    return await api.put<{ mensaje: string; rol: Rol }>(`/rol/${id}/permisos`, {
        permisos,
    });
}
