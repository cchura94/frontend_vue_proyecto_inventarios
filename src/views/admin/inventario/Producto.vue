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
                    label="Buscar por nombre" prepend-inner-icon="mdi-magnify"
                    variant="outlined" @keyup.enter="listarProductos" />
                <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="productos" v-model:page="page"
                    :items-length="productos.length" :loading="cargando" item-value="name" @update:options="listarProductos" hover>

                    <template v-slot:item.imagen="{ item }">
                        <img :src="`http://localhost:8000/${item.imagen}`" alt="" width="50px">
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <div class="d-flex ga-2 justify-end">
                            
                            <v-btn @click="funAbrirActualizarImagen(item)">
                                Actualizar Imagen
                            </v-btn>

                            <v-btn color="primary" icon="mdi-pencil" size="small" variant="text"
                                @click="abrirEditar(item)" />
                            <v-btn color="error" icon="mdi-delete" size="small" variant="text"
                                @click="abrirEliminar(item)" />
                        </div>
                    </template>

                </v-data-table-server>
            </v-card-text>
        </v-card>

        <!-- Crear / Editar -->
        <v-dialog v-model="dialog" max-width="600" persistent>
            <v-card rounded="lg">
                <v-card-title class="d-flex align-center ga-2">
                    <v-icon color="primary" icon="mdi-warehouse-cog" />
                    {{ form.id ? 'Editar producto' : 'Nuevo Producto' }}
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-form ref="formRef" @submit.prevent="guardar">
                      
                        <v-row>
                            <v-col cols="12" sm="7">
                                <v-text-field
                                    v-model="form.nombre"
                                    :error-messages="errores.nombre"
                                    label="Nombre"
                                    placeholder="Ej. Laptop Asu20.0"
                                    prepend-inner-icon="mdi-warehouse"
                                    :rules="[obligatorio]"
                                    variant="outlined"
                                />
                            </v-col>

                            <v-col cols="12" sm="5">
                                <v-text-field
                                    v-model="form.precio_venta_actual"
                                    :error-messages="errores.precio_venta_actual"
                                    label="Precio"
                                    placeholder="Ej. 30"

                                    prepend-inner-icon="mdi-warehouse"
                                    :rules="[obligatorio]"
                                    variant="outlined"
                                />
                            </v-col>

                            <v-col cols="12">
                                <v-radio-group v-model="form.categoria_id" >
                                    <v-radio  :label="cat.nombre" :value="cat.id" v-for="cat in categorias"></v-radio>
                                </v-radio-group>
                            </v-col>

                            <v-col cols="12">
                                <v-textarea
                                    v-model="form.descripcion"
                                    :error-messages="errores.descripcion"
                                    label="Descripción"
                                    placeholder="Descripción opcional del almacén"
                                    prepend-inner-icon="mdi-text"
                                    rows="3"
                                    variant="outlined"
                                />
                            </v-col>
                            <v-file-input label="Seleccionar Imagen" v-model="img_file"></v-file-input>


                        </v-row>
                    </v-form>
                </v-card-text>

                <v-divider />

                <v-card-actions class="pa-4">
                    <v-btn variant="text" @click="cerrarDialogo">
                        Cancelar
                    </v-btn>

                    <v-spacer />

                    <v-btn
                        color="primary"
                        :loading="guardando"
                        prepend-icon="mdi-content-save"
                        @click="guardar"
                    >
                        {{ form.id ? 'Actualizar' : 'Guardar' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        

    <v-dialog
      v-model="dialogImagen"
      width="auto"
    >
      <v-card
        max-width="400"
        prepend-icon="mdi-update"
      >
      <v-card-title>
        Actualizar Imagen
      </v-card-title>

      <v-card-subtitle>
        Selecciona la imagen y luego Guardar
      </v-card-subtitle>
        <v-card-text>
              <v-file-input label="Seleccionar Imagen" v-model="img_file"></v-file-input>
    <!--
            <input type="file" color="primary" icon="mdi-image" size="small" variant="text"
                                    @change="seleccionarImagen" />
        -->
                                    
                                    <v-btn
                                      class="ms-auto"
                                      text="Actualizar Imagen de Producto"
                                      @click="seleccionarImagen"
                                    ></v-btn>
                                </v-card-text>
                            </v-card>
    </v-dialog>
    </v-container>
    
</template>

<script lang="ts" setup>
import type { Producto } from '@/services/interfaces/Producto';
import { onMounted, ref } from 'vue';
import { funGuardar, funListar, funModificar, funSubirImagen } from '@/services/producto.service'
import * as catService from '@/services/categoria.service'

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
const dialogImagen = ref(false)
const guardando = ref(false);
const snackbar = ref({ visible: false, texto: '', color: 'success' });
const prod_id = ref<any>(-1);
const img_file = ref<any>();

const page = ref(1)
const formRef = ref<any>(null);

    function obligatorio(valor: unknown) {
    return (valor !== null && valor !== undefined && String(valor).trim() !== '')
        || 'Este campo es obligatorio';
}

function cerrarDialogo() {
    dialog.value = false;
    form.value = vacio();
    errores.value = {};
}

function funAbrirActualizarImagen(prod: any){
    prod_id.value = prod;
    dialogImagen.value = true;
}

function funActualizarImagen(event: any){
    console.log(event);
}

const categorias = ref<any>([]);


onMounted(() => {
    listarProductos()
    listarCategorias()
})

async function listarProductos() {
    cargando.value = true;
    const { data } = await funListar(page.value, itemsPerPage.value, buscar.value, '');
    productos.value = data.data
    cargando.value = false;
}

async function listarCategorias() {
    cargando.value = true;
    const { data } = await catService.funListar();
    categorias.value = data
    cargando.value = false;
}

const vacio = (): Producto => ({
    id: 0,
    nombre: '',
    descripcion: '',
    precio_venta_actual: '',
    imagen: '',
    estado: true,
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

async function guardar() {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    guardando.value = true;
    errores.value = {};

    try {
        const payload: Producto = {
            nombre: form.value.nombre.trim(),
            precio_venta_actual: form.value.precio_venta_actual.trim(),
            descripcion: form.value.descripcion?.trim() || "",
            categoria_id: form.value.categoria_id,
            estado: true
        };

        let payload2: any = new FormData();
        payload2.append("nombre", form.value.nombre.trim())
         payload2.append("precio_venta_actual", form.value.precio_venta_actual.trim())
         payload2.append("descripcion", form.value.descripcion?.trim() || "")
         payload2.append("categoria_id", form.value.categoria_id)
         payload2.append("estado", true);
         payload2.append("imagen", img_file.value);

        if (form.value.id) {
            await funModificar(form.value.id, payload2);
            notificar('Almacén actualizado correctamente.');
        } else {
            await funGuardar(payload2);
            notificar('Almacén registrado correctamente.');
        }

        dialogImagen.value = false;
        
        dialog.value = false;
        form.value = vacio();
        await listarProductos();
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        guardando.value = false;
    }
}

function notificar(texto: string, color = 'success') {
    snackbar.value = { visible: true, texto, color };
}

function extraerErrores(error: any) {
    errores.value = {};

    const campos = error?.response?.data?.errors ?? {};
    for (const [campo, mensajes] of Object.entries(campos)) {
        errores.value[campo] = (mensajes as string[])[0] ?? 'Valor inválido';
    }

    return error?.response?.data?.message ?? 'Ocurrió un error inesperado.';
}

async function seleccionarImagen(event: any){
  
    if(img_file.value){
        
        const formdata = new FormData()
        formdata.append("imagen", img_file.value)
        await funSubirImagen(prod_id.value.id, formdata)
    
        listarProductos()
        dialogImagen.value = false;
        img_file.value = null
    }
}
</script>