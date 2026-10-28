import api from "./api";

export async function funListar(){
    return await api.get("/usuario", {headers: {Authorization: "Bearer 227|AoT5NFx1TvypzbU8BlK3U89166GZEP5getscBxh4ed4de33b"}});
}

export function funGuardar(){

}

export function funMostrar(){

}

export function funModificar(){

}

export function funEliminar(){

}