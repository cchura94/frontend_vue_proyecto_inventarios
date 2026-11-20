import api from "./api";
import type { Almacen } from "./interfaces/Almacen";

export async function funListar(sucursal_id?: number | null, limit: number = 100) {
    return await api.get("/almacen", {
        params: {
            sucursal_id: sucursal_id || undefined,
            limit,
        },
    });
}

export async function funGuardar(almacen: Almacen) {
    return await api.post("/almacen", almacen);
}

export async function funMostrar(id: number) {
    return await api.get(`/almacen/${id}`);
}

export async function funModificar(id: number, almacen: Almacen) {
    return await api.put(`/almacen/${id}`, almacen);
}

export async function funEliminar(id: number) {
    return await api.delete(`/almacen/${id}`);
}
