<template>

    <v-container fluid class="py-6">
        <v-card rounded="lg" elevation="2">
            <!-- Encabezado -->
            <v-toolbar flat color="transparent">
                <v-icon class="ms-2" color="primary" icon="mdi-store-marker" />
                <v-toolbar-title class="text-h6 font-weight-bold">
                    Gestión de Productos
                </v-toolbar-title>

                <v-btn v-if="$can('crear', 'Producto')" color="primary" prepend-icon="mdi-plus" rounded="lg" @click="abrirCrear">
                    Nuevo Producto
                </v-btn>
            </v-toolbar>

            <v-card-subtitle class="pb-2">
                {{ totalProductos }} productos registrados
            </v-card-subtitle>

            <v-divider />

            <v-card-text>
                <v-row dense class="mb-2">
                    <v-col cols="12" md="4">
                        <v-select v-model="sucursal_id" :items="sucursales" clearable density="comfortable" hide-details
                            item-title="nombre" item-value="id" label="Sucursal"
                            prepend-inner-icon="mdi-store-marker" variant="outlined"
                            @update:model-value="onSucursalChange" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-select v-model="almacen_id" :items="almacenes" clearable density="comfortable" hide-details
                            item-title="nombre" item-value="id" label="Almacén"
                            prepend-inner-icon="mdi-warehouse" variant="outlined"
                            @update:model-value="onAlmacenChange" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-text-field v-model="buscar" clearable density="comfortable" hide-details
                            label="Buscar por nombre" prepend-inner-icon="mdi-magnify" variant="outlined"
                            @update:model-value="onBuscarChange" />
                    </v-col>
                </v-row>

                <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="productos" v-model:page="page"
                    :items-length="totalProductos" :loading="cargando" item-value="id" @update:options="listarProductos" hover>

                    <template v-slot:item.imagen="{ item }">
                        <img :src="`http://localhost:8000/${item.imagen}`" alt="" width="50px">
                    </template>

                    <template v-slot:item.stock="{ item }">
                        <div v-if="item.almacenes?.length" class="py-1">
                            <div v-for="alm in item.almacenes" :key="alm.id"
                                class="d-flex align-center justify-space-between ga-3 py-1"
                                :class="{ 'text-primary font-weight-bold': esSeleccionado(alm) }">
                                <div class="text-caption">
                                    <v-icon icon="mdi-store-marker" size="14" />
                                    {{ alm.sucursal?.nombre || 'Sin sucursal' }}
                                    <span class="text-medium-emphasis">· {{ alm.nombre }}</span>
                                </div>

                                <v-chip :color="colorStock(item, alm)" size="x-small" variant="tonal">
                                    {{ alm.pivot?.cantidad_actual ?? 0 }}
                                </v-chip>
                            </div>

                            <v-divider class="my-1" />

                            <div class="d-flex align-center justify-space-between text-caption font-weight-bold">
                                <span>Total</span>
                                <span>{{ totalStock(item) }}</span>
                            </div>
                        </div>

                        <span v-else class="text-caption text-medium-emphasis">Sin stock registrado</span>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <div class="d-flex ga-2 justify-end">
                            
                            <v-btn v-if="$can('editar', 'Producto')" @click="funAbrirActualizarImagen(item)">
                                Actualizar Imagen
                            </v-btn>

                            <v-btn v-if="$can('editar', 'Producto')" color="primary" icon="mdi-pencil" size="small" variant="text"
                                @click="abrirEditar(item)" />
                            <v-btn v-if="$can('eliminar', 'Producto')" color="error" icon="mdi-delete" size="small" variant="text"
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
                        v-if="$can(form.id ? 'editar' : 'crear', 'Producto')"
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

        <v-snackbar v-model="snackbar.visible" :color="snackbar.color" location="top right" timeout="3500">
            {{ snackbar.texto }}
        </v-snackbar>
    </v-container>
    
</template>

<script lang="ts" setup>
import type { Producto, StockAlmacen } from '@/services/interfaces/Producto';
import type { Sucursal } from '@/services/interfaces/Sucursal';
import type { Almacen } from '@/services/interfaces/Almacen';
import { onMounted, ref } from 'vue';
import { funGuardar, funListar, funModificar, funSubirImagen } from '@/services/producto.service'
import * as catService from '@/services/categoria.service'
import * as almService from '@/services/almacen.service'
import * as sucService from '@/services/sucursal.service'

const itemsPerPage = ref(10)

const productos = ref<Producto[]>([]);
const totalProductos = ref(0);
const headers = [
    { title: 'ID', key: 'id', width: 70 },
    { title: 'NOMBRE', key: 'nombre' },
    { title: 'PRECIO VENTA', key: 'precio_venta_actual' },
    { title: 'IMAGEN', key: 'imagen' },
    { title: 'CATEGORIA', key: 'categoria.nombre' },
    { title: 'STOCK POR ALMACÉN', key: 'stock', width: 340, sortable: false },
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

const sucursal_id = ref<number | null>(null);
const almacen_id = ref<number | null>(null);
const sucursales = ref<Sucursal[]>([]);
const almacenes = ref<Almacen[]>([]);
let buscarTimer: ReturnType<typeof setTimeout> | undefined;

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
    listarSucursales()
    listarAlmacenes()
})

async function listarProductos() {
    cargando.value = true;
    try {
        const { data } = await funListar(
            page.value,
            itemsPerPage.value,
            buscar.value,
            almacen_id.value,
            sucursal_id.value,
        );
        productos.value = data?.data ?? [];
        totalProductos.value = data?.total ?? productos.value.length;
    } catch (error) {
        productos.value = [];
        totalProductos.value = 0;
        notificar(extraerErrores(error), 'error');
    } finally {
        cargando.value = false;
    }
}

async function listarCategorias() {
    try {
        const { data } = await catService.funListar();
        categorias.value = data;
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    }
}

async function listarSucursales() {
    try {
        const { data } = await sucService.funListar();
        sucursales.value = Array.isArray(data) ? data : (data?.data ?? []);
    } catch (error) {
        sucursales.value = [];
        notificar(extraerErrores(error), 'error');
    }
}

async function listarAlmacenes() {
    try {
        const { data } = await almService.funListar(sucursal_id.value);
        almacenes.value = Array.isArray(data) ? data : (data?.data ?? []);
    } catch (error) {
        almacenes.value = [];
        notificar(extraerErrores(error), 'error');
    }
}

async function onSucursalChange() {
    almacen_id.value = null;
    page.value = 1;
    await listarAlmacenes();
    await listarProductos();
}

function onAlmacenChange() {
    page.value = 1;
    listarProductos();
}

function onBuscarChange(valor: string | null) {
    buscar.value = valor ?? '';
    clearTimeout(buscarTimer);
    buscarTimer = setTimeout(() => {
        page.value = 1;
        listarProductos();
    }, 400);
}

function esSeleccionado(almacen: StockAlmacen) {
    if (almacen_id.value) return almacen_id.value === almacen.id;
    if (sucursal_id.value) return sucursal_id.value === almacen.sucursal?.id;

    return false;
}

function stockAlmacen(almacen: StockAlmacen) {
    return Number(almacen.pivot?.cantidad_actual ?? 0);
}

function totalStock(prod: Producto) {
    return (prod.almacenes ?? []).reduce((total, almacen) => total + stockAlmacen(almacen), 0);
}

function colorStock(prod: Producto, almacen: StockAlmacen) {
    const cantidad = stockAlmacen(almacen);

    if (cantidad <= 0) return 'error';
    if (cantidad <= Number(prod.stock_minimo ?? 0)) return 'warning';

    return 'success';
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