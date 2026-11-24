import api from "./api";
import type { Cliente } from "./interfaces/Cliente";

export async function funListar(page: number = 1, limit: number = 20, search: string = '') {
    return await api.get("/cliente", {
        params: {
            page,
            limit,
            search,
        },
    });
}

export async function funGuardar(cliente: Cliente) {
    return await api.post("/cliente", cliente);
}

export async function funMostrar(id: number) {
    return await api.get(`/cliente/${id}`);
}

export async function funModificar(id: number, cliente: Cliente) {
    return await api.put(`/cliente/${id}`, cliente);
}

export async function funEliminar(id: number) {
    return await api.delete(`/cliente/${id}`);
}
