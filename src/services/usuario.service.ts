import api from "./api";
import type { Usuario, UsuarioPayload } from "./interfaces/Usuario";

export async function funListar() {
    return await api.get<Usuario[]>("/usuario");
}

export async function funGuardar(datos: UsuarioPayload) {
    return await api.post("/usuario", datos);
}

export async function funMostrar(id: number) {
    return await api.get<Usuario>("/usuario/" + id);
}

export async function funModificar(id: number, datos: UsuarioPayload) {
    return await api.put("/usuario/" + id, datos);
}

export async function funEliminar(id: number) {
    return await api.delete("/usuario/" + id);
}
