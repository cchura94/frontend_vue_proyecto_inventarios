import api from "./api";
import type { Producto } from "./interfaces/Producto";

export async function funListar(page: number=1,limit:number=10) {
    return await api.get(`/producto?page=${page}&limit=${limit}`);
}

export async function funGuardar(prod: Producto) {
    return await api.post("/producto", prod);
}

export async function funMostrar(id: number) {
    return await api.get(`/producto/${id}`);
}

export async function funModificar(id: number, prod: Producto) {
    return await api.put(`/producto/${id}`, prod);
}

export async function funEliminar(id: number) {
    return await api.delete(`/producto/${id}`);
}
