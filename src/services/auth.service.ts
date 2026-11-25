import api from "./api";
import type { LoginResponse, PerfilResponse } from "./interfaces/Auth";

export async function loginConlaravel(email: string, password: string) {
    return await api.post<LoginResponse>("v1/auth/login", { email, password });
}

export async function obtenerPerfil() {
    return await api.get<PerfilResponse>("v1/auth/profile");
}

export async function logout() {
    return await api.post("v1/auth/logout");
}

export async function register() {

}
