<template>

    <v-container fluid class="py-6">
        <v-card rounded="lg" elevation="2">
            <!-- Encabezado -->
            <v-toolbar flat color="transparent">
                <v-icon class="ms-2" color="primary" icon="mdi-store-marker" />
                <v-toolbar-title class="text-h6 font-weight-bold">
                    Gestión de Productos
                </v-toolbar-title>

                <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" @click="abrirCrear">
                    Nuevo Producto
                </v-btn>
            </v-toolbar>

            <v-card-subtitle class="pb-2">
                {{ productos.length }} productos registradas
            </v-card-subtitle>

            <v-divider />

            <v-card-text>
                <v-text-field v-model="buscar" class="mb-4" clearable density="comfortable" hide-details
                    label="Buscar por nombre, ciudad, dirección o teléfono" prepend-inner-icon="mdi-magnify"
                    variant="outlined" />
                <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="productos" v-model:page="page"
                    :items-length="30" :loading="cargando" item-value="name" @update:options="listarProductos" hover>

                    <template v-slot:item.imagen="{ item }">
                        <img :src="`https://backinventarios.blumbit.net/${item.imagen}`" alt="" width="50px">
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <div class="d-flex ga-2 justify-end">
                            <v-btn color="primary" icon="mdi-pencil" size="small" variant="text"
                                @click="abrirEditar(item)" />
                            <v-btn color="error" icon="mdi-delete" size="small" variant="text"
                                @click="abrirEliminar(item)" />
                        </div>
                    </template>

                </v-data-table-server>
            </v-card-text>
        </v-card>
    </v-container>
    <h1>Productos</h1>
    <pre>{{ productos }}</pre>
</template>

<script lang="ts" setup>
import type { Producto } from '@/services/interfaces/Producto';
import { onMounted, ref } from 'vue';
import { funListar } from '@/services/producto.service'

const itemsPerPage = ref(10)

const productos = ref<Producto[]>([]);
const headers = [
    { title: 'ID', key: 'id', width: 70 },
    { title: 'NOMBRE', key: 'nombre' },
    { title: 'PRECIO VENTA', key: 'precio_venta_actual' },
    { title: 'IMAGEN', key: 'imagen' },
    { title: 'CATEGORIA', key: 'categoria.nombre' },
    { title: 'REGISTRADO', key: 'created_at' },
    { title: 'ACCIONES', key: 'actions', align: 'end' as const, sortable: false },
];
const cargando = ref(false);
const buscar = ref('');
const errores = ref<Record<string, string>>({});
const dialog = ref(false);

const page = ref(1)


onMounted(() => {
    listarProductos()
})

async function listarProductos() {
    cargando.value = true;
    const { data } = await funListar(page.value, itemsPerPage.value);
    productos.value = data.data
    cargando.value = false;
}

const vacio = (): Producto => ({
    id: 0,
    nombre: '',
    descripcion: '',
    precio_venta_actual: '',
    imagen: '',
    estado: '',
    categoria_id: -1
});
const form = ref<Producto>(vacio());

function abrirCrear() {
    form.value = vacio();
    errores.value = {};
    dialog.value = true;
}

function abrirEditar(prod: Producto){

}
function abrirEliminar(prod: Producto){

}

</script>