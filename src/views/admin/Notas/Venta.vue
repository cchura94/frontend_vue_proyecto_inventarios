<template>
    <v-container fluid class="py-6">
        <v-card rounded="lg" elevation="2">
            <!-- Encabezado -->
            <v-toolbar flat color="transparent">
                <v-icon class="ms-2" color="primary" icon="mdi-cash-register" />
                <v-toolbar-title class="text-h6 font-weight-bold">
                    Registrar Venta
                </v-toolbar-title>
            </v-toolbar>

            <v-divider />

            <v-card-text>
                <v-row>
                    <!-- Columna 1: sucursal, almacén, búsqueda y productos -->
                    <v-col cols="12" md="7">
                        <v-card variant="outlined" rounded="lg" class="h-100 d-flex flex-column">
                            <v-card-title class="d-flex align-center text-subtitle-1 font-weight-bold">
                                <v-icon class="me-2" color="primary" icon="mdi-package-variant-closed" />
                                Productos
                                <v-spacer />
                                <v-chip size="small" variant="tonal">{{ totalProductos }}</v-chip>
                            </v-card-title>

                            <v-card-text class="pb-0">
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
                                            variant="outlined" @update:model-value="onAlmacenChange" />
                                    </v-col>

                                    <v-col cols="12">
                                        <v-text-field v-model="buscar" :disabled="!almacen_id" clearable
                                            density="comfortable" hide-details
                                            label="Buscar producto por nombre o código"
                                            prepend-inner-icon="mdi-magnify" variant="outlined"
                                            @update:model-value="onBuscarChange" />
                                    </v-col>
                                </v-row>
                            </v-card-text>

                            <v-card-text class="flex-grow-1 lista-productos" style="max-height: 500px; overflow-y: auto;">
                                <div v-if="!almacen_id" class="text-center text-medium-emphasis py-10">
                                    <v-icon class="mb-2" icon="mdi-warehouse" size="40" />
                                    <div>Selecciona una sucursal y un almacén para ver el stock disponible.</div>
                                </div>

                                <template v-else>
                                    <v-progress-linear v-if="cargandoProductos" class="mb-2" color="primary"
                                        indeterminate />

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
                                                <div class="d-flex align-center ga-2">
                                                    <v-chip :color="stockProducto(prod) > 0 ? 'success' : 'error'"
                                                        size="x-small" variant="tonal">
                                                        Stock: {{ stockProducto(prod) }}
                                                    </v-chip>

                                                    <v-btn color="primary" :disabled="stockProducto(prod) <= 0"
                                                        icon="mdi-cart-plus" size="small" variant="tonal"
                                                        @click="agregarProducto(prod)" />
                                                </div>
                                            </template>
                                        </v-list-item>
                                    </v-list>

                                    <div v-else-if="!cargandoProductos"
                                        class="text-center text-medium-emphasis py-10">
                                        <v-icon class="mb-2" icon="mdi-package-variant" size="40" />
                                        <div>
                                            {{
                                                buscar
                                                    ? 'No se encontraron productos con ese criterio.'
                                                    : 'No hay productos en este almacén.'
                                            }}
                                        </div>
                                    </div>
                                </template>
                            </v-card-text>

                            <template v-if="almacen_id && totalPaginas > 1">
                                <v-divider />
                                <v-card-actions class="justify-center">
                                    <v-pagination v-model="page" :length="totalPaginas" :total-visible="5"
                                        density="comfortable" @update:model-value="listarProductos" />
                                </v-card-actions>
                            </template>
                        </v-card>
                    </v-col>

                    <!-- Columna 2: carrito + cliente + guardar -->
                    <v-col cols="12" md="5">
                        <v-card variant="outlined" rounded="lg" class="h-100 d-flex flex-column">
                            <v-card-title class="d-flex align-center text-subtitle-1 font-weight-bold">
                                <v-icon class="me-2" color="primary" icon="mdi-cart" />
                                Carrito de venta
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
                                                <th class="text-right" style="width: 115px;">P. venta</th>
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
                                                        Stock: {{ stockProducto(item.producto) }}
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
                                    <v-col cols="12">
                                        <div class="d-flex ga-2 align-center">
                                            <v-autocomplete v-model="cliente_id" :items="clientes"
                                                :loading="cargandoClientes" class="flex-grow-1" clearable
                                                density="comfortable" hide-details item-title="nombre_completo"
                                                item-value="id" label="Cliente" no-filter
                                                prepend-inner-icon="mdi-account" variant="outlined"
                                                @update:search="onBuscarCliente" />

                                            <v-btn v-if="$can('crear', 'Cliente')" color="primary" icon="mdi-account-plus" size="large"
                                                title="Nuevo cliente" variant="tonal" @click="abrirCliente" />
                                        </div>
                                    </v-col>

                                    <v-col cols="12">
                                        <v-textarea v-model="observaciones" density="comfortable" hide-details
                                            label="Observaciones" placeholder="Observaciones de la venta (opcional)"
                                            prepend-inner-icon="mdi-text" rows="2" variant="outlined" />
                                    </v-col>

                                    <v-col cols="12">
                                        <v-btn v-if="$can('crear', 'Venta')" block color="primary" prepend-icon="mdi-content-save" size="large"
                                            :loading="guardando" @click="guardarVenta">
                                            Guardar Venta
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Crear cliente -->
        <v-dialog v-model="dialogCliente" max-width="600" persistent>
            <v-card rounded="lg">
                <v-card-title class="d-flex align-center ga-2">
                    <v-icon color="primary" icon="mdi-account-plus" />
                    Nuevo cliente
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-form ref="formClienteRef" @submit.prevent="guardarCliente">
                        <v-row dense>
                            <v-col cols="12">
                                <v-text-field v-model="formCliente.nombre_completo" label="Nombre completo"
                                    placeholder="Ej. Juan Pérez" prepend-inner-icon="mdi-account"
                                    :rules="[obligatorio]" variant="outlined" />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <v-text-field v-model="formCliente.nro_identificacion" label="Nro. identificación"
                                    prepend-inner-icon="mdi-card-account-details-outline" variant="outlined" />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <v-text-field v-model="formCliente.fecha_nacimiento" label="Fecha de nacimiento"
                                    prepend-inner-icon="mdi-cake-variant-outline" type="date" variant="outlined" />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <v-text-field v-model="formCliente.telefono" label="Teléfono"
                                    prepend-inner-icon="mdi-phone" variant="outlined" />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <v-text-field v-model="formCliente.correo" label="Correo"
                                    prepend-inner-icon="mdi-email-outline" variant="outlined" />
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-divider />

                <v-card-actions class="pa-4">
                    <v-btn variant="text" @click="cerrarDialogoCliente">Cancelar</v-btn>

                    <v-spacer />

                    <v-btn color="primary" :loading="guardandoCliente" prepend-icon="mdi-content-save"
                        @click="guardarCliente">
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
import type { Cliente } from '@/services/interfaces/Cliente';
import type { Sucursal } from '@/services/interfaces/Sucursal';
import type { Almacen } from '@/services/interfaces/Almacen';
import type { VentaPayload } from '@/services/interfaces/Venta';
import { BASE_URL } from '@/services/api';
import { funListar as funListarProductos } from '@/services/producto.service';
import { funListar as funListarSucursales } from '@/services/sucursal.service';
import { funListar as funListarAlmacenes } from '@/services/almacen.service';
import { funGuardar as funGuardarVenta } from '@/services/venta.service';
import { funGuardar as funGuardarCliente, funListar as funListarClientes } from '@/services/cliente.service';

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

const clientes = ref<Cliente[]>([]);
const cliente_id = ref<number | null>(null);
const cargandoClientes = ref(false);

const carrito = ref<CarritoItem[]>([]);
const observaciones = ref('');
const guardando = ref(false);

const dialogCliente = ref(false);
const guardandoCliente = ref(false);
const formClienteRef = ref<any>(null);
const formCliente = ref<Cliente>(vacioCliente());

const snackbar = ref({ visible: false, texto: '', color: 'success' });

let buscarTimer: ReturnType<typeof setTimeout> | undefined;
let clienteTimer: ReturnType<typeof setTimeout> | undefined;

const totalPaginas = computed(() => Math.max(1, Math.ceil(totalProductos.value / itemsPerPage)));

const totalCarrito = computed(() =>
    carrito.value.reduce((total, item) => total + item.cantidad * (Number(item.precio) || 0), 0),
);

function vacioCliente(): Cliente {
    return {
        nombre_completo: '',
        nro_identificacion: '',
        fecha_nacimiento: '',
        telefono: '',
        correo: '',
        estado: true,
    };
}

onMounted(() => {
    listarSucursales();
    listarClientes();
});

async function listarProductos() {
    if (!almacen_id.value) {
        productos.value = [];
        totalProductos.value = 0;
        return;
    }

    cargandoProductos.value = true;

    try {
        const { data } = await funListarProductos(
            page.value,
            itemsPerPage,
            buscar.value,
            almacen_id.value,
            null,
        );

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

async function listarClientes(search = '') {
    cargandoClientes.value = true;

    try {
        const { data } = await funListarClientes(1, 20, search);
        clientes.value = data?.data ?? [];
    } catch (error) {
        clientes.value = [];
        notificar(extraerErrores(error), 'error');
    } finally {
        cargandoClientes.value = false;
    }
}

function onSucursalChange() {
    almacen_id.value = null;
    almacenes.value = [];
    productos.value = [];
    totalProductos.value = 0;
    vaciarCarritoPorCambio();

    if (sucursal_id.value) {
        listarAlmacenes();
    }
}

function onAlmacenChange() {
    page.value = 1;
    vaciarCarritoPorCambio();

    if (almacen_id.value) {
        listarProductos();
    } else {
        productos.value = [];
        totalProductos.value = 0;
    }
}

function vaciarCarritoPorCambio() {
    if (carrito.value.length) {
        carrito.value = [];
        notificar('Se vació el carrito porque cambió el almacén.', 'info');
    }
}

function onBuscarChange(valor: string | null) {
    buscar.value = valor ?? '';

    if (!almacen_id.value) return;

    clearTimeout(buscarTimer);
    buscarTimer = setTimeout(() => {
        page.value = 1;
        listarProductos();
    }, 400);
}

function onBuscarCliente(valor: string) {
    const seleccionado = clientes.value.find((cli) => cli.id === cliente_id.value);

    if (seleccionado && valor === seleccionado.nombre_completo) return;

    clearTimeout(clienteTimer);
    clienteTimer = setTimeout(() => listarClientes(valor ?? ''), 400);
}

function stockProducto(prod: Producto) {
    if (!almacen_id.value) return 0;

    const almacen = (prod.almacenes ?? []).find((item) => item.id === almacen_id.value);

    return Number(almacen?.pivot?.cantidad_actual ?? 0);
}

function agregarProducto(prod: Producto) {
    if (!almacen_id.value) {
        notificar('Selecciona un almacén.', 'warning');
        return;
    }

    const stock = stockProducto(prod);

    if (stock <= 0) {
        notificar('El producto no tiene stock en este almacén.', 'warning');
        return;
    }

    const existente = carrito.value.find((item) => item.producto.id === prod.id);

    if (existente) {
        if (existente.cantidad >= stock) {
            notificar('No hay más stock disponible.', 'warning');
            return;
        }

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
    const stock = stockProducto(item.producto);

    if (item.cantidad >= stock) {
        notificar('No hay más stock disponible.', 'warning');
        return;
    }

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

async function guardarVenta() {
    if (!carrito.value.length) {
        notificar('Agrega al menos un producto al carrito.', 'warning');
        return;
    }

    if (!almacen_id.value) {
        notificar('Selecciona una sucursal y un almacén.', 'warning');
        return;
    }

    if (!cliente_id.value) {
        notificar('Selecciona o crea un cliente.', 'warning');
        return;
    }

    for (const item of carrito.value) {
        const stock = stockProducto(item.producto);

        if (item.cantidad > stock) {
            notificar(
                `Stock insuficiente para ${item.producto.nombre}. Disponible: ${stock}.`,
                'error',
            );
            return;
        }
    }

    guardando.value = true;

    try {
        const payload: VentaPayload = {
            cliente_id: cliente_id.value,
            descuento_total: 0,
            detalle: 'Venta de mostrador',
            observaciones: observaciones.value.trim() || 'S/O',
            movimientos: carrito.value.map((item) => ({
                almacen_id: almacen_id.value as number,
                producto_id: item.producto.id as number,
                cantidad: item.cantidad,
                precio_unitario_venta: Number(item.precio) || 0,
                observaciones: 'NINGUNO',
            })),
        };

        await funGuardarVenta(payload);

        notificar('Venta registrada correctamente.');
        carrito.value = [];
        observaciones.value = '';
        await listarProductos();
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        guardando.value = false;
    }
}

function abrirCliente() {
    formCliente.value = vacioCliente();
    dialogCliente.value = true;
}

function cerrarDialogoCliente() {
    dialogCliente.value = false;
    formCliente.value = vacioCliente();
}

async function guardarCliente() {
    const { valid } = await formClienteRef.value.validate();
    if (!valid) return;

    guardandoCliente.value = true;

    try {
        const payload: Cliente = {
            nombre_completo: formCliente.value.nombre_completo.trim(),
            nro_identificacion: formCliente.value.nro_identificacion?.trim() || null,
            fecha_nacimiento: formCliente.value.fecha_nacimiento || null,
            telefono: formCliente.value.telefono?.trim() || null,
            correo: formCliente.value.correo?.trim() || null,
            estado: true,
        };

        const { data } = await funGuardarCliente(payload);
        const creado: Cliente = data?.cliente ?? data;

        if (creado?.id) {
            clientes.value = [creado, ...clientes.value];
            cliente_id.value = creado.id;
        }

        notificar('Cliente registrado correctamente.');
        dialogCliente.value = false;
        formCliente.value = vacioCliente();
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        guardandoCliente.value = false;
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
        ?? error?.response?.data?.error
        ?? error?.response?.data?.mensaje
        ?? error?.response?.data?.message
        ?? 'Ocurrió un error inesperado.';
}
</script>
