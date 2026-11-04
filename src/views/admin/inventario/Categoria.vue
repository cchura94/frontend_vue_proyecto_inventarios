<template>
    <h1>Lista de Categorias</h1>
    <form @submit.prevent="funGuardarCategoria()">

        <label for="">Ingrese Nombre</label>
        <input type="text" v-model="categoria.nombre">
        <br>
        <label for="">Ingrese Descripción</label>
        <textarea v-model="categoria.descripcion"></textarea>
        <br>

        <input type="submit" value="guardar Categoria">        
    </form>
    <table border="1">
        <tr>
            <td>ID</td>
            <td>NOMBRE</td>
            <td>DESCRIPCIÓN</td>
            <td>ACCIÓN</td>
        </tr>
        <tr v-for="cat in categorias">
            <td>{{ cat.id }}</td>
            <td>{{ cat.nombre }}</td>
            <td>{{ cat.descripcion }}</td>
            <td>
                <button>mostrar</button>
                <button @click="funEditarCategoria(cat)">editar</button>
                <button>eliminar</button>
            </td>
        </tr>

    </table>
    <pre>{{ categorias }}</pre>
</template>
<script lang="ts" setup>
import { funGuardar, funListar, funModificar } from "@/services/categoria.service"
import type { Categoria } from "@/services/interfaces/Categoria";
import { onMounted, ref } from "vue";

const categorias = ref<Categoria[]>([]);
const categoria = ref<Categoria>({nombre: ""})

onMounted(()=>{
    listarCategorias()
})

async function listarCategorias(){
    const {data} = await funListar();
    categorias.value = data;
}

async function funGuardarCategoria(){
    try {
        if(categoria.value.id){
            await funModificar(categoria.value.id, categoria.value);
             categoria.value = {nombre: ""}
            listarCategorias();
        }else{
            
            await funGuardar(categoria.value);
    
            categoria.value = {nombre: ""}
            listarCategorias();
        }
        
    } catch (error) {
        console.log(error);
    }
}

async function funEditarCategoria(cat: Categoria){
    categoria.value = cat;
}

</script>