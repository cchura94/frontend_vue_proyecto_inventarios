import api from "./api";
import type { Sucursal } from "./interfaces/Sucursal";

export async function funListar() {
    return await api.get("/sucursal");
}

export async function funGuardar(sucursal: Sucursal) {
    return await api.post("/sucursal", sucursal);
}

export async function funMostrar(id: number) {
    return await api.get(`/sucursal/${id}`);
}

export async function funModificar(id: number, sucursal: Sucursal) {
    return await api.put(`/sucursal/${id}`, sucursal);
}

export async function funEliminar(id: number) {
    return await api.delete(`/sucursal/${id}`);
}
