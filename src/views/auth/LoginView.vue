<template>
    <div>
        {{ credenciales }}
        <h1>Ingresar</h1>
        <label for="">Ingrese su Correo:</label>
        <input type="email" v-model="credenciales.email">
        <br>
        <label for="">Ingrese su Contraseña</label>
        <input type="password" v-model="credenciales.password">
        <br>
        <button @click="login()">Iniciar Sesion</button>

    </div>
</template>

<script lang="ts" setup>
import { loginConlaravel } from "@/services/auth.service"
import { ref } from "vue";

const credenciales = ref({email: "", password: ""});

async function login(){
    const {data} = await loginConlaravel(credenciales.value.email, credenciales.value.password);

    console.log(data);
}

</script>