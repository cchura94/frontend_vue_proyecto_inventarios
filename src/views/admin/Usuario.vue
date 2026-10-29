<template>
    <h1>Lista Usuarios</h1>

    <div>
        <label for="">Ingrese su Correo</label>
        <input type="email" v-model="usuario.email">
        <br>
        <label for="">Ingrese su Nombre</label>
        <input type="text" v-model="usuario.name">
        <br>
        <label for="">Ingrese su Contraseña</label>
        <input type="password" v-model="usuario.password">
        <br>
        <button type="button" @click="funGuardarUsuario()">Guardar Usuario</button>
    </div>
    <table border="1">
        <thead>
            <tr>
                <td>ID</td>
                <td>NOMBRE</td>
                <td>CORREO</td>
                <td>ACCIONES</td>
            </tr>
        </thead>
        <tbody>
            <tr v-for="user in usuarios.data" key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td><button @click="funEditarUsuario(user)">editar</button>
                    <button @click="funEliminar(user.id)">Eliminar</button>
                </td>

            </tr>
        </tbody>
    </table>
    <pre>{{ usuarios }}</pre>
</template>

<script lang="ts" setup>
import { funListar, funGuardar, funModificar } from "@/services/usuario.service"
import { onMounted, ref } from "vue";

const usuarios = ref<any>([]);
const usuario = ref({id:0, email: "", name: "", password: ""});

async function funListarUsuarios(){
    const { data } = await funListar();
    usuarios.value = data;
}

async function funGuardarUsuario(){
    if(usuario.value.id){
        await funModificar(usuario.value.id, usuario.value)
    }
    await funGuardar(usuario.value);
    funListarUsuarios()
    usuario.value = {id: 0, email: "", name: "", password: ""}
}

async function funEditarUsuario(user: any){
    usuario.value = user;
}

async function funEliminar(id: number){
    if(confirm("Está seguro de eliminar el registro")){
        await funEliminar(id)

        funListarUsuarios()

    }
}

onMounted(()=>{
    funListarUsuarios()
})

</script>