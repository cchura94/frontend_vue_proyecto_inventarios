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

    <v-card title="Gestión Categorias">
        <v-data-table :headers="headers" :items="categorias" density="compact" :hide-default-footer="categorias.length < 3" v-model:sort-by="sortBy">

            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>
                        <v-icon color="medium-emphasis" icon="mdi-book-multiple" size="x-small" start></v-icon>

                        Categorias
                    </v-toolbar-title>

                    <v-btn class="me-2" prepend-icon="mdi-plus" rounded="lg" text="Nueva Categoria" border
                        @click="dialog = true"></v-btn>
                </v-toolbar>
            </template>

            <template v-slot:item.actions="{ item }">
                <div class="d-flex ga-2 justify-end">
                    <v-icon color="medium-emphasis" icon="mdi-pencil" size="small"
                        @click="funEditarCategoria(item)"></v-icon>

                    <v-icon color="medium-emphasis" icon="mdi-delete" size="small"
                        @click="funEditarCategoria(item)"></v-icon>
                </div>
            </template>

        </v-data-table>

    </v-card>

    <table>
        <thead>
            <tr>
                <td>ID</td>
                <td>NOMBRE</td>
                <td>DESCRIPCIÓN</td>
                <td>ACCIÓN</td>
            </tr>
        </thead>
        <tbody>
            <tr v-for="cat in categorias" :key="cat.id">
                <td>{{ cat.id }}</td>
                <td>{{ cat.nombre }}</td>
                <td>{{ cat.descripcion }}</td>
                <td>
                    <button>mostrar</button>
                    <button @click="funEditarCategoria(cat)">editar</button>
                    <button>eliminar</button>
                </td>
            </tr>

        </tbody>

    </table>
    <pre>{{ categorias }}</pre>


    <v-dialog v-model="dialog" max-width="500">
        <v-card :subtitle="`${categoria.id ? 'Modificar' : 'Crear'} tu categoria `"
            :title="`${categoria.id ? 'Editar' : 'Agregar'} una Categoria`">
            <template v-slot:text>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="categoria.nombre" label="Nombre"></v-text-field>
                    </v-col>

                    <v-col cols="12">
                        <v-text-field v-model="categoria.descripcion" label="Descripción"></v-text-field>
                    </v-col>

                </v-row>
            </template>

            <v-divider></v-divider>

            <v-card-actions class="bg-surface-light">
                <v-btn text="Cancelar" variant="plain" @click="dialog = false"></v-btn>

                <v-spacer></v-spacer>

                <v-btn text="Guardar" @click="funGuardarCategoria"></v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script lang="ts" setup>
import { funGuardar, funListar, funModificar } from "@/services/categoria.service"
import type { Categoria } from "@/services/interfaces/Categoria";
import { onMounted, ref } from "vue";

const categorias = ref<Categoria[]>([]);
const categoria = ref<Categoria>({ nombre: "" })

const dialog = ref<boolean>(false)
const sortBy = ref<any>([{ key: 'id', order: 'asc' }])

const headers = [
    {title: "ID", key:"id"},
    {title: "NOMBRE", key:"nombre"},
    {title: "DETALLE", key:"descripcion"}
]

onMounted(() => {
    listarCategorias()
})

async function listarCategorias() {
    const { data } = await funListar();
    categorias.value = data;
}

async function funGuardarCategoria() {
    try {
        if (categoria.value.id) {
            await funModificar(categoria.value.id, categoria.value);
            categoria.value = { nombre: "" }
            listarCategorias();
        } else {

            await funGuardar(categoria.value);

            categoria.value = { nombre: "" }
            listarCategorias();
        }
        dialog.value = false;

    } catch (error) {
        console.log(error);
    }
}

async function funEditarCategoria(cat: Categoria) {
    categoria.value = cat;
}

</script>