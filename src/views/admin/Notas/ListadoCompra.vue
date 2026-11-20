<template>
    <v-container fluid class="py-6">
        <v-card rounded="lg" elevation="2">
            <!-- Encabezado -->
            <v-toolbar flat color="transparent">
                <v-icon class="ms-2" color="primary" icon="mdi-format-list-bulleted" />
                <v-toolbar-title class="text-h6 font-weight-bold">
                    Listado de Compras
                </v-toolbar-title>

                <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" to="/admin/compra">
                    Nueva Compra
                </v-btn>

                <v-btn class="ms-2" color="primary" :loading="generandoReporte" prepend-icon="mdi-file-pdf-box"
                    rounded="lg" variant="tonal" @click="descargarReporte">
                    Reporte PDF
                </v-btn>
            </v-toolbar>

            <v-card-subtitle class="pb-2">
                {{ totalCompras }} compras registradas
            </v-card-subtitle>

            <v-divider />

            <v-card-text>
                <v-row dense class="mb-2">
                    <v-col cols="12" md="4">
                        <v-text-field v-model="buscar" clearable density="comfortable" hide-details
                            label="Buscar por código, proveedor o usuario" prepend-inner-icon="mdi-magnify"
                            variant="outlined" @update:model-value="onBuscarChange" />
                    </v-col>

                    <v-col cols="12" sm="6" md="3">
                        <v-text-field v-model="desde" density="comfortable" hide-details label="Desde" type="date"
                            variant="outlined" @update:model-value="onFiltroChange" />
                    </v-col>

                    <v-col cols="12" sm="6" md="3">
                        <v-text-field v-model="hasta" density="comfortable" hide-details label="Hasta" type="date"
                            variant="outlined" @update:model-value="onFiltroChange" />
                    </v-col>

                    <v-col class="d-flex align-center" cols="12" md="2">
                        <v-btn block prepend-icon="mdi-filter-off" variant="tonal" @click="limpiarFiltros">
                            Limpiar
                        </v-btn>
                    </v-col>
                </v-row>

                <v-data-table-server v-model:items-per-page="itemsPerPage" v-model:page="page" :headers="headers"
                    :items="compras" :items-length="totalCompras" :loading="cargando" hover item-value="id"
                    @update:options="listarCompras">

                    <template v-slot:item.codigo="{ item }">
                        <v-chip color="primary" size="small" variant="tonal">{{ item.codigo }}</v-chip>
                    </template>

                    <template v-slot:item.fecha="{ item }">
                        {{ formatearFecha(item.fecha) }}
                    </template>

                    <template v-slot:item.proveedor="{ item }">
                        {{ item.proveedor?.razon_social || '—' }}
                    </template>

                    <template v-slot:item.user="{ item }">
                        {{ item.user?.name || '—' }}
                    </template>

                    <template v-slot:item.items="{ item }">
                        {{ item.almacen_producto_compra?.length ?? 0 }}
                    </template>

                    <template v-slot:item.total="{ item }">
                        <span class="font-weight-medium">Bs {{ monto(totalCompra(item)) }}</span>
                    </template>

                    <template v-slot:item.estado="{ item }">
                        <v-chip :color="colorEstado(item.estado)" size="small" variant="tonal">
                            {{ item.estado }}
                        </v-chip>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <div class="d-flex ga-1 justify-end">
                            <v-btn color="primary" icon="mdi-eye" size="small" variant="text" title="Ver detalle"
                                @click="abrirDetalle(item)" />
                            <v-btn color="error" icon="mdi-file-pdf-box" size="small" variant="text"
                                title="Descargar recibo PDF" :loading="pdfId === item.id"
                                @click="descargarPdf(item)" />
                        </div>
                    </template>

                    <template v-slot:no-data>
                        <div class="py-6 text-center text-medium-emphasis">
                            <v-icon class="mb-2" icon="mdi-receipt-text-outline" size="40" />
                            <div>
                                {{
                                    hayFiltros
                                        ? 'No se encontraron compras con esos filtros.'
                                        : 'No existen compras registradas.'
                                }}
                            </div>
                        </div>
                    </template>

                    <template v-slot:loading>
                        <v-skeleton-loader type="table-row@5" />
                    </template>
                </v-data-table-server>

                <div class="d-flex justify-end mt-3">
                    <span class="text-caption text-medium-emphasis">
                        Monto de esta página: <strong>Bs {{ monto(montoPagina) }}</strong>
                    </span>
                </div>
            </v-card-text>
        </v-card>

        <!-- Detalle de la compra -->
        <v-dialog v-model="dialogDetalle" max-width="950">
            <v-card rounded="lg">
                <v-card-title class="d-flex align-center ga-2">
                    <v-icon color="primary" icon="mdi-receipt-text-outline" />
                    Compra {{ compraDetalle?.codigo }}

                    <v-spacer />

                    <v-chip :color="colorEstado(compraDetalle?.estado)" size="small" variant="tonal">
                        {{ compraDetalle?.estado }}
                    </v-chip>
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <strong>Proveedor:</strong> {{ compraDetalle?.proveedor?.razon_social || '—' }}
                        </v-col>

                        <v-col cols="12" sm="6">
                            <strong>Usuario:</strong> {{ compraDetalle?.user?.name || '—' }}
                        </v-col>

                        <v-col cols="12" sm="6">
                            <strong>Fecha:</strong> {{ formatearFecha(compraDetalle?.fecha) }}
                        </v-col>

                        <v-col cols="12" sm="6">
                            <strong>Detalle:</strong> {{ compraDetalle?.detalle || '—' }}
                        </v-col>
                    </v-row>

                    <v-divider class="my-3" />

                    <v-table density="compact">
                        <thead>
                            <tr>
                                <th style="width: 40px;">N.º</th>
                                <th>Producto</th>
                                <th>Almacén</th>
                                <th class="text-center" style="width: 80px;">Cantidad</th>
                                <th class="text-right" style="width: 120px;">P. unitario</th>
                                <th class="text-right" style="width: 120px;">Subtotal</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(prod, index) in compraDetalle?.almacen_producto_compra ?? []"
                                :key="prod.id + '-' + index">
                                <td>{{ index + 1 }}</td>
                                <td>
                                    <div class="font-weight-medium">{{ prod.nombre }}</div>
                                    <div v-if="prod.pivot?.observaciones" class="text-caption text-medium-emphasis">
                                        {{ prod.pivot?.observaciones }}
                                    </div>
                                </td>
                                <td class="text-caption">{{ almacenTexto(prod.pivot?.almacen_id) }}</td>
                                <td class="text-center">{{ prod.pivot?.cantidad ?? 0 }}</td>
                                <td class="text-right">{{ monto(prod.pivot?.precio_unitario_compra) }}</td>
                                <td class="text-right">
                                    {{
                                        monto(
                                            Number(prod.pivot?.cantidad ?? 0)
                                            * Number(prod.pivot?.precio_unitario_compra ?? 0),
                                        )
                                    }}
                                </td>
                            </tr>

                            <tr v-if="!compraDetalle?.almacen_producto_compra?.length">
                                <td class="text-center text-medium-emphasis" colspan="6">
                                    Esta compra no tiene productos registrados.
                                </td>
                            </tr>
                        </tbody>
                    </v-table>

                    <div class="d-flex justify-end mt-3">
                        <div style="min-width: 260px;">
                            <div class="d-flex justify-space-between text-body-2">
                                <span>Subtotal</span>
                                <span>Bs {{ monto(subtotalDetalle) }}</span>
                            </div>

                            <div class="d-flex justify-space-between text-body-2">
                                <span>Descuento</span>
                                <span>Bs {{ monto(compraDetalle?.descuento_total) }}</span>
                            </div>

                            <v-divider class="my-1" />

                            <div class="d-flex justify-space-between font-weight-bold">
                                <span>Total</span>
                                <span>Bs {{ monto(totalDetalle) }}</span>
                            </div>
                        </div>
                    </div>

                    <v-divider class="my-3" />

                    <div>
                        <strong>Observaciones:</strong>
                        {{ compraDetalle?.observaciones || 'Sin observaciones' }}
                    </div>
                </v-card-text>

                <v-divider />

                <v-card-actions class="pa-4">
                    <v-btn variant="text" @click="dialogDetalle = false">Cerrar</v-btn>

                    <v-spacer />

                    <v-btn color="error" prepend-icon="mdi-file-pdf-box"
                        :loading="pdfId === compraDetalle?.id"
                        @click="compraDetalle && descargarPdf(compraDetalle)">
                        Descargar recibo
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
import type { Compra } from '@/services/interfaces/Compra';
import type { Almacen } from '@/services/interfaces/Almacen';
import { funGenerarPdf, funListar, funReportePdf } from '@/services/compra.service';
import { funListar as funListarAlmacenes } from '@/services/almacen.service';

const headers = [
    { title: 'CÓDIGO', key: 'codigo', width: 150 },
    { title: 'FECHA', key: 'fecha', width: 160 },
    { title: 'PROVEEDOR', key: 'proveedor' },
    { title: 'USUARIO', key: 'user', width: 140 },
    { title: 'ÍTEMS', key: 'items', width: 80, align: 'center' as const },
    { title: 'TOTAL', key: 'total', width: 130, align: 'end' as const },
    { title: 'ESTADO', key: 'estado', width: 130 },
    { title: 'ACCIONES', key: 'actions', align: 'end' as const, sortable: false },
];

const compras = ref<Compra[]>([]);
const totalCompras = ref(0);
const almacenes = ref<Almacen[]>([]);

const page = ref(1);
const itemsPerPage = ref(10);
const buscar = ref('');
const desde = ref('');
const hasta = ref('');
const cargando = ref(false);
const generandoReporte = ref(false);
const pdfId = ref<number | null>(null);

const dialogDetalle = ref(false);
const compraDetalle = ref<Compra | null>(null);

const snackbar = ref({ visible: false, texto: '', color: 'success' });

let buscarTimer: ReturnType<typeof setTimeout> | undefined;

const hayFiltros = computed(() => !!(buscar.value.trim() || desde.value || hasta.value));

const montoPagina = computed(() =>
    compras.value.reduce((total, compra) => total + totalCompra(compra), 0),
);

const subtotalDetalle = computed(() =>
    (compraDetalle.value?.almacen_producto_compra ?? []).reduce(
        (total, prod) =>
            total + Number(prod.pivot?.cantidad ?? 0) * Number(prod.pivot?.precio_unitario_compra ?? 0),
        0,
    ),
);

const totalDetalle = computed(
    () => subtotalDetalle.value - Number(compraDetalle.value?.descuento_total ?? 0),
);

onMounted(() => {
    listarCompras();
    listarAlmacenes();
});

async function listarCompras() {
    cargando.value = true;

    try {
        const { data } = await funListar(page.value, itemsPerPage.value, {
            search: buscar.value.trim(),
            desde: desde.value,
            hasta: hasta.value,
        });

        compras.value = data?.data ?? [];
        totalCompras.value = data?.total ?? compras.value.length;
    } catch (error) {
        compras.value = [];
        totalCompras.value = 0;
        notificar(extraerErrores(error), 'error');
    } finally {
        cargando.value = false;
    }
}

async function listarAlmacenes() {
    try {
        const { data } = await funListarAlmacenes(null, 100);
        almacenes.value = Array.isArray(data) ? data : (data?.data ?? []);
    } catch {
        almacenes.value = [];
    }
}

function onBuscarChange(valor: string | null) {
    buscar.value = valor ?? '';
    clearTimeout(buscarTimer);
    buscarTimer = setTimeout(() => {
        page.value = 1;
        listarCompras();
    }, 400);
}

function onFiltroChange() {
    page.value = 1;
    listarCompras();
}

function limpiarFiltros() {
    buscar.value = '';
    desde.value = '';
    hasta.value = '';
    page.value = 1;
    listarCompras();
}

function abrirDetalle(compra: Compra) {
    compraDetalle.value = compra;
    dialogDetalle.value = true;
}

function totalCompra(compra: Compra) {
    const subtotal = (compra.almacen_producto_compra ?? []).reduce(
        (total, prod) =>
            total + Number(prod.pivot?.cantidad ?? 0) * Number(prod.pivot?.precio_unitario_compra ?? 0),
        0,
    );

    return subtotal - Number(compra.descuento_total ?? 0);
}

function almacenTexto(almacenId?: number | null) {
    if (!almacenId) return '—';

    const almacen = almacenes.value.find((item) => item.id === almacenId);

    if (!almacen) return `Almacén #${almacenId}`;

    return almacen.sucursal?.nombre
        ? `${almacen.sucursal.nombre} · ${almacen.nombre}`
        : almacen.nombre;
}

function colorEstado(estado?: string) {
    if (estado === 'COMPLETADO') return 'success';
    if (estado === 'EN PROCESO') return 'warning';
    if (estado === 'ANULADO') return 'error';

    return 'default';
}

function formatearFecha(fecha?: string | null) {
    if (!fecha) return '—';

    const date = new Date(fecha.replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return fecha;

    return date.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function monto(valor: number | string | null | undefined) {
    return Number(valor ?? 0).toFixed(2);
}

async function descargarPdf(compra: Compra) {
    if (!compra.id) return;

    pdfId.value = compra.id;

    try {
        const { data } = await funGenerarPdf(compra.id);
        descargarBlob(data, `${compra.codigo || 'compra'}.pdf`);
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        pdfId.value = null;
    }
}

async function descargarReporte() {
    generandoReporte.value = true;

    try {
        const { data } = await funReportePdf({
            search: buscar.value.trim(),
            desde: desde.value,
            hasta: hasta.value,
        });

        descargarBlob(data, 'reporte-compras.pdf');
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        generandoReporte.value = false;
    }
}

function descargarBlob(data: BlobPart, nombre: string) {
    const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
    const link = document.createElement('a');

    link.href = url;
    link.download = nombre;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
