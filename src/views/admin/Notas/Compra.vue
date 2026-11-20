<template>
    <v-container fluid class="py-6">
        <v-card rounded="lg" elevation="2">
            <!-- Encabezado -->
            <v-toolbar flat color="transparent">
                <v-icon class="ms-2" color="primary" icon="mdi-cart-plus" />
                <v-toolbar-title class="text-h6 font-weight-bold">
                    Registrar Compra
                </v-toolbar-title>
            </v-toolbar>

            <v-divider />

            <v-card-text>
                <v-row>
                    <!-- Columna 1: listado / filtro de productos -->
                    <v-col cols="12" md="7">
                        <v-card variant="outlined" rounded="lg" class="h-100 d-flex flex-column">
                            <v-card-title class="d-flex align-center text-subtitle-1 font-weight-bold">
                                <v-icon class="me-2" color="primary" icon="mdi-package-variant-closed" />
                                Productos
                                <v-spacer />
                                <v-chip size="small" variant="tonal">{{ totalProductos }}</v-chip>
                            </v-card-title>

                            <v-card-text class="pb-0">
                                <v-text-field v-model="buscar" clearable density="comfortable" hide-details
                                    label="Buscar producto por nombre o código" prepend-inner-icon="mdi-magnify"
                                    variant="outlined" @update:model-value="onBuscarChange" />
                            </v-card-text>

                            <v-card-text class="flex-grow-1 lista-productos" style="max-height: 540px; overflow-y: auto;">
                                <v-progress-linear v-if="cargandoProductos" class="mb-2" color="primary" indeterminate />

                                <v-list v-if="productos.length" density="compact" lines="two">
                                    <v-list-item v-for="prod in productos" :key="prod.id" class="rounded-lg">
                                        <template #prepend>
                                            <v-avatar class="me-3" color="grey-lighten-3" rounded size="48">
                                                <v-img v-if="prod.imagen" :src="urlImagen(prod.imagen)" cover />
                                                <v-icon v-else icon="mdi-package-variant" />
                                            </v-avatar>
                                        </template>

                                        <v-list-item-title class="font-weight-medium">
                                            {{ prod.nombre }}
                                        </v-list-item-title>

                                        <v-list-item-subtitle>
                                            {{ prod.categoria?.nombre || 'Sin categoría' }}
                                            · Venta: Bs {{ monto(prod.precio_venta_actual) }}
                                        </v-list-item-subtitle>

                                        <template #append>
                                            <v-btn color="primary" icon="mdi-cart-plus" size="small" variant="tonal"
                                                @click="agregarProducto(prod)" />
                                        </template>
                                    </v-list-item>
                                </v-list>

                                <div v-else-if="!cargandoProductos" class="text-center text-medium-emphasis py-10">
                                    <v-icon class="mb-2" icon="mdi-package-variant" size="40" />
                                    <div>
                                        {{
                                            buscar
                                                ? 'No se encontraron productos con ese criterio.'
                                                : 'No existen productos registrados.'
                                        }}
                                    </div>
                                </div>
                            </v-card-text>

                            <template v-if="totalPaginas > 1">
                                <v-divider />
                                <v-card-actions class="justify-center">
                                    <v-pagination v-model="page" :length="totalPaginas" :total-visible="5"
                                        density="comfortable" @update:model-value="listarProductos" />
                                </v-card-actions>
                            </template>
                        </v-card>
                    </v-col>

                    <!-- Columna 2: carrito + sucursal/almacén + proveedor + guardar -->
                    <v-col cols="12" md="5">
                        <v-card variant="outlined" rounded="lg" class="h-100 d-flex flex-column">
                            <v-card-title class="d-flex align-center text-subtitle-1 font-weight-bold">
                                <v-icon class="me-2" color="primary" icon="mdi-cart" />
                                Carrito de compra
                                <v-spacer />
                                <v-chip size="small" variant="tonal">{{ carrito.length }} ítem(s)</v-chip>
                            </v-card-title>

                            <v-card-text class="flex-grow-1">
                                <div v-if="!carrito.length" class="text-center text-medium-emphasis py-10">
                                    <v-icon class="mb-2" icon="mdi-cart-outline" size="40" />
                                    <div>Agrega productos desde la lista.</div>
                                </div>

                                <template v-else>
                                    <v-table density="compact">
                                        <thead>
                                            <tr>
                                                <th class="text-left">Producto</th>
                                                <th class="text-right" style="width: 115px;">P. compra</th>
                                                <th class="text-center" style="width: 110px;">Cantidad</th>
                                                <th class="text-right" style="width: 90px;">Subtotal</th>
                                                <th style="width: 40px;"></th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <tr v-for="item in carrito" :key="item.producto.id">
                                                <td>
                                                    <div class="text-body-2 font-weight-medium">
                                                        {{ item.producto.nombre }}
                                                    </div>
                                                    <div class="text-caption text-medium-emphasis">
                                                        {{ item.producto.categoria?.nombre || 'Sin categoría' }}
                                                    </div>
                                                </td>

                                                <td>
                                                    <v-text-field v-model="item.precio" density="compact"
                                                        hide-details min="0" prefix="Bs" step="0.01" type="number"
                                                        variant="outlined" />
                                                </td>

                                                <td>
                                                    <div class="d-flex align-center justify-center ga-1">
                                                        <v-btn icon="mdi-minus" size="x-small" variant="text"
                                                            @click="disminuir(item)" />
                                                        <span class="text-body-2 font-weight-medium"
                                                            style="min-width: 22px; text-align: center;">
                                                            {{ item.cantidad }}
                                                        </span>
                                                        <v-btn icon="mdi-plus" size="x-small" variant="text"
                                                            @click="incrementar(item)" />
                                                    </div>
                                                </td>

                                                <td class="text-right text-body-2">
                                                    {{ monto(item.cantidad * (Number(item.precio) || 0)) }}
                                                </td>

                                                <td class="text-right">
                                                    <v-btn color="error" icon="mdi-delete-outline" size="x-small"
                                                        variant="text" @click="quitarProducto(item)" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-table>

                                    <v-divider class="my-3" />

                                    <div class="d-flex align-center justify-space-between">
                                        <span class="text-subtitle-2">Total</span>
                                        <span class="text-h6 font-weight-bold">Bs {{ monto(totalCarrito) }}</span>
                                    </div>
                                </template>
                            </v-card-text>

                            <v-divider />

                            <v-card-text>
                                <v-row dense>
                                    <v-col cols="12" sm="6">
                                        <v-select v-model="sucursal_id" :items="sucursales" clearable
                                            density="comfortable" hide-details item-title="nombre" item-value="id"
                                            label="Sucursal" prepend-inner-icon="mdi-store-marker"
                                            variant="outlined" @update:model-value="onSucursalChange" />
                                    </v-col>

                                    <v-col cols="12" sm="6">
                                        <v-select v-model="almacen_id" :disabled="!sucursal_id" :items="almacenes"
                                            clearable density="comfortable" hide-details item-title="nombre"
                                            item-value="id" label="Almacén" prepend-inner-icon="mdi-warehouse"
                                            variant="outlined" />
                                    </v-col>

                                    <v-col cols="12">
                                        <div class="d-flex ga-2 align-center">
                                            <v-autocomplete v-model="proveedor_id" :items="proveedores"
                                                :loading="cargandoProveedores" class="flex-grow-1" clearable
                                                density="comfortable" hide-details item-title="razon_social"
                                                item-value="id" label="Proveedor" no-filter
                                                prepend-inner-icon="mdi-truck-delivery" variant="outlined"
                                                @update:search="onBuscarProveedor" />

                                            <v-btn color="primary" icon="mdi-plus" size="large" title="Nuevo proveedor"
                                                variant="tonal" @click="abrirProveedor" />
                                        </div>
                                    </v-col>

                                    <v-col cols="12">
                                        <v-textarea v-model="observaciones" density="comfortable" hide-details
                                            label="Observaciones" placeholder="Observaciones de la compra (opcional)"
                                            prepend-inner-icon="mdi-text" rows="2" variant="outlined" />
                                    </v-col>

                                    <v-col cols="12">
                                        <v-btn block color="primary" prepend-icon="mdi-content-save" size="large"
                                            :loading="guardando" @click="guardarCompra">
                                            Guardar Compra
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Crear proveedor -->
        <v-dialog v-model="dialogProveedor" max-width="600" persistent>
            <v-card rounded="lg">
                <v-card-title class="d-flex align-center ga-2">
                    <v-icon color="primary" icon="mdi-truck-plus" />
                    Nuevo proveedor
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-form ref="formProveedorRef" @submit.prevent="guardarProveedor">
                        <v-row dense>
                            <v-col cols="12">
                                <v-text-field v-model="formProveedor.razon_social" label="Razón social"
                                    placeholder="Ej. Distribuidora Comercial S.A." prepend-inner-icon="mdi-domain"
                                    :rules="[obligatorio]" variant="outlined" />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <v-text-field v-model="formProveedor.nro_identificacion" label="Nro. identificación"
                                    prepend-inner-icon="mdi-card-account-details-outline" variant="outlined" />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <v-text-field v-model="formProveedor.contacto" label="Contacto"
                                    prepend-inner-icon="mdi-account" variant="outlined" />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <v-text-field v-model="formProveedor.telefono" label="Teléfono"
                                    prepend-inner-icon="mdi-phone" variant="outlined" />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <v-text-field v-model="formProveedor.correo" label="Correo"
                                    prepend-inner-icon="mdi-email-outline" variant="outlined" />
                            </v-col>

                            <v-col cols="12">
                                <v-textarea v-model="formProveedor.observaciones" label="Observaciones"
                                    prepend-inner-icon="mdi-text" rows="2" variant="outlined" />
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-divider />

                <v-card-actions class="pa-4">
                    <v-btn variant="text" @click="cerrarDialogoProveedor">Cancelar</v-btn>

                    <v-spacer />

                    <v-btn color="primary" :loading="guardandoProveedor" prepend-icon="mdi-content-save"
                        @click="guardarProveedor">
                        Guardar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="snackbar.visible" :color="snackbar.color" location="top right" timeout="3500">
            {{ snackbar.texto }}
        </v-snackbar>
    </v-container>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import type { Producto } from '@/services/interfaces/Producto';
import type { Proveedor } from '@/services/interfaces/Proveedor';
import type { Sucursal } from '@/services/interfaces/Sucursal';
import type { Almacen } from '@/services/interfaces/Almacen';
import type { CompraPayload } from '@/services/interfaces/Compra';
import { BASE_URL } from '@/services/api';
import { funListar as funListarProductos } from '@/services/producto.service';
import { funListar as funListarSucursales } from '@/services/sucursal.service';
import { funListar as funListarAlmacenes } from '@/services/almacen.service';
import { funGuardar as funGuardarCompra } from '@/services/compra.service';
import { funGuardar as funGuardarProveedor, funListar as funListarProveedores } from '@/services/proveedor.service';

interface CarritoItem {
    producto: Producto;
    cantidad: number;
    precio: string;
}

const itemsPerPage = 8;

const productos = ref<Producto[]>([]);
const totalProductos = ref(0);
const page = ref(1);
const buscar = ref('');
const cargandoProductos = ref(false);

const sucursales = ref<Sucursal[]>([]);
const almacenes = ref<Almacen[]>([]);
const sucursal_id = ref<number | null>(null);
const almacen_id = ref<number | null>(null);

const proveedores = ref<Proveedor[]>([]);
const proveedor_id = ref<number | null>(null);
const cargandoProveedores = ref(false);

const carrito = ref<CarritoItem[]>([]);
const observaciones = ref('');
const guardando = ref(false);

const dialogProveedor = ref(false);
const guardandoProveedor = ref(false);
const formProveedorRef = ref<any>(null);
const formProveedor = ref<Proveedor>(vacioProveedor());

const snackbar = ref({ visible: false, texto: '', color: 'success' });

let buscarTimer: ReturnType<typeof setTimeout> | undefined;
let proveedorTimer: ReturnType<typeof setTimeout> | undefined;

const totalPaginas = computed(() => Math.max(1, Math.ceil(totalProductos.value / itemsPerPage)));

const totalCarrito = computed(() =>
    carrito.value.reduce((total, item) => total + item.cantidad * (Number(item.precio) || 0), 0),
);

function vacioProveedor(): Proveedor {
    return {
        razon_social: '',
        nro_identificacion: '',
        contacto: '',
        telefono: '',
        correo: '',
        observaciones: '',
        estado: true,
    };
}

onMounted(() => {
    listarProductos();
    listarSucursales();
    listarProveedores();
});

async function listarProductos() {
    cargandoProductos.value = true;
    try {
        const { data } = await funListarProductos(page.value, itemsPerPage, buscar.value, null, null);
        productos.value = data?.data ?? [];
        totalProductos.value = data?.total ?? productos.value.length;
    } catch (error) {
        productos.value = [];
        totalProductos.value = 0;
        notificar(extraerErrores(error), 'error');
    } finally {
        cargandoProductos.value = false;
    }
}

function onBuscarChange(valor: string | null) {
    buscar.value = valor ?? '';
    clearTimeout(buscarTimer);
    buscarTimer = setTimeout(() => {
        page.value = 1;
        listarProductos();
    }, 400);
}

async function listarSucursales() {
    try {
        const { data } = await funListarSucursales();
        sucursales.value = Array.isArray(data) ? data : (data?.data ?? []);
    } catch (error) {
        sucursales.value = [];
        notificar(extraerErrores(error), 'error');
    }
}

async function listarAlmacenes() {
    try {
        const { data } = await funListarAlmacenes(sucursal_id.value);
        almacenes.value = Array.isArray(data) ? data : (data?.data ?? []);
    } catch (error) {
        almacenes.value = [];
        notificar(extraerErrores(error), 'error');
    }
}

function onSucursalChange() {
    almacen_id.value = null;

    if (sucursal_id.value) {
        listarAlmacenes();
    } else {
        almacenes.value = [];
    }
}

async function listarProveedores(search = '') {
    cargandoProveedores.value = true;
    try {
        const { data } = await funListarProveedores(1, 20, search);
        proveedores.value = data?.data ?? [];
    } catch (error) {
        proveedores.value = [];
        notificar(extraerErrores(error), 'error');
    } finally {
        cargandoProveedores.value = false;
    }
}

function onBuscarProveedor(valor: string) {
    const seleccionado = proveedores.value.find((prov) => prov.id === proveedor_id.value);

    // Al seleccionar un proveedor, Vuetify actualiza la búsqueda con su nombre:
    // no hace falta volver a consultar en ese caso.
    if (seleccionado && valor === seleccionado.razon_social) return;

    clearTimeout(proveedorTimer);
    proveedorTimer = setTimeout(() => listarProveedores(valor ?? ''), 400);
}

function agregarProducto(prod: Producto) {
    const existente = carrito.value.find((item) => item.producto.id === prod.id);

    if (existente) {
        existente.cantidad += 1;
        return;
    }

    carrito.value.push({
        producto: prod,
        cantidad: 1,
        precio: String(prod.precio_venta_actual ?? ''),
    });
}

function incrementar(item: CarritoItem) {
    item.cantidad += 1;
}

function disminuir(item: CarritoItem) {
    if (item.cantidad > 1) {
        item.cantidad -= 1;
    } else {
        quitarProducto(item);
    }
}

function quitarProducto(item: CarritoItem) {
    carrito.value = carrito.value.filter((linea) => linea !== item);
}

async function guardarCompra() {
    if (!carrito.value.length) {
        notificar('Agrega al menos un producto al carrito.', 'warning');
        return;
    }

    if (!sucursal_id.value) {
        notificar('Selecciona una sucursal.', 'warning');
        return;
    }

    if (!almacen_id.value) {
        notificar('Selecciona un almacén.', 'warning');
        return;
    }

    if (!proveedor_id.value) {
        notificar('Selecciona o crea un proveedor.', 'warning');
        return;
    }

    guardando.value = true;

    try {
        const payload: CompraPayload = {
            proveedor_id: proveedor_id.value,
            descuento_total: 0,
            detalle: 'S/D',
            observaciones: observaciones.value.trim() || 'S/O',
            movimientos: carrito.value.map((item) => ({
                almacen_id: almacen_id.value as number,
                producto_id: item.producto.id as number,
                cantidad: item.cantidad,
                precio_unitario_compra: Number(item.precio) || 0,
                observaciones: 'NINGUNO',
            })),
        };

        await funGuardarCompra(payload);

        notificar('Compra registrada correctamente.');
        carrito.value = [];
        observaciones.value = '';
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        guardando.value = false;
    }
}

function abrirProveedor() {
    formProveedor.value = vacioProveedor();
    dialogProveedor.value = true;
}

function cerrarDialogoProveedor() {
    dialogProveedor.value = false;
    formProveedor.value = vacioProveedor();
}

async function guardarProveedor() {
    const { valid } = await formProveedorRef.value.validate();
    if (!valid) return;

    guardandoProveedor.value = true;

    try {
        const payload: Proveedor = {
            razon_social: formProveedor.value.razon_social.trim(),
            nro_identificacion: formProveedor.value.nro_identificacion?.trim() || null,
            contacto: formProveedor.value.contacto?.trim() || null,
            telefono: formProveedor.value.telefono?.trim() || null,
            correo: formProveedor.value.correo?.trim() || null,
            observaciones: formProveedor.value.observaciones?.trim() || null,
            estado: true,
        };

        const { data } = await funGuardarProveedor(payload);
        const creado: Proveedor = data?.proveedor ?? data;

        if (creado?.id) {
            proveedores.value = [creado, ...proveedores.value];
            proveedor_id.value = creado.id;
        }

        notificar('Proveedor registrado correctamente.');
        dialogProveedor.value = false;
        formProveedor.value = vacioProveedor();
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        guardandoProveedor.value = false;
    }
}

function monto(valor: number | string | null | undefined) {
    return Number(valor ?? 0).toFixed(2);
}

function urlImagen(imagen?: string) {
    return `${BASE_URL}/${imagen}`;
}

function obligatorio(valor: unknown) {
    return (valor !== null && valor !== undefined && String(valor).trim() !== '')
        || 'Este campo es obligatorio';
}

function notificar(texto: string, color = 'success') {
    snackbar.value = { visible: true, texto, color };
}

function extraerErrores(error: any) {
    const campos = error?.response?.data?.errors ?? {};
    const primerError = Object.values(campos)[0] as string[] | undefined;

    return primerError?.[0]
        ?? error?.response?.data?.mensaje
        ?? error?.response?.data?.message
        ?? 'Ocurrió un error inesperado.';
}
</script>
