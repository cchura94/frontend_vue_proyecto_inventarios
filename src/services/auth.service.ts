import api from "./api";

export async function loginConlaravel(email: string, password:string){
    const respuesta = await api.post("v1/auth/login", {email, password});
    return respuesta
}

export async function logout(){

}

export async function register(){

}