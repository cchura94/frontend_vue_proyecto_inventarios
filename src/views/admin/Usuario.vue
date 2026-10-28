<template>
    <h1>Lista Usuarios</h1>
    <pre>{{ usuarios }}</pre>
</template>

<script lang="ts" setup>
import { funListar } from "@/services/usuario.service"
import { onMounted, ref } from "vue";

const usuarios = ref([]);

async function funListarUsuarios(){
    const { data } = await funListar();
    usuarios.value = data;
}

onMounted(()=>{
    funListarUsuarios()
})

</script>