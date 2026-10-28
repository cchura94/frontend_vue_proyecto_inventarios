import api from "./api";

export async function loginConlaravel(email: string, password:string){
    return await api.post("v1/auth/login", {email, password});
}

export async function logout(){

}

export async function register(){

}