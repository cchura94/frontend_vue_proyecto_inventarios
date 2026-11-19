import api from "./api";
import type { Producto } from "./interfaces/Producto";

export async function funListar(page: number=1,limit:number=10, search:string='', almacen_id:string) {
    return await api.get(`/producto?page=${page}&limit=${limit}&search=${search}&almacen_id=${almacen_id}`);
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

export async function funSubirImagen(id: number, formdata: any){
    return await api.post(`/producto/${id}/subir-imagen`, formdata);
}
