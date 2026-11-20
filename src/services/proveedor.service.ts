import api from "./api";
import type { Proveedor } from "./interfaces/Proveedor";

export async function funListar(page: number = 1, limit: number = 20, search: string = '') {
    return await api.get("/proveedor", {
        params: {
            page,
            limit,
            search,
        },
    });
}

export async function funGuardar(proveedor: Proveedor) {
    return await api.post("/proveedor", proveedor);
}

export async function funMostrar(id: number) {
    return await api.get(`/proveedor/${id}`);
}

export async function funModificar(id: number, proveedor: Proveedor) {
    return await api.put(`/proveedor/${id}`, proveedor);
}

export async function funEliminar(id: number) {
    return await api.delete(`/proveedor/${id}`);
}
