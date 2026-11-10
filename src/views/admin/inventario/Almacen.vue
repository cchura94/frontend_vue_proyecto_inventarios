<template>
    <v-container fluid class="py-6">
        <v-card rounded="lg" elevation="2">
            <!-- Encabezado -->
            <v-toolbar flat color="transparent">
                <v-icon class="ms-2" color="primary" icon="mdi-warehouse" />
                <v-toolbar-title class="text-h6 font-weight-bold">
                    Gestión de Almacenes
                </v-toolbar-title>

                <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    rounded="lg"
                    @click="abrirCrear"
                >
                    Nuevo Almacén
                </v-btn>
            </v-toolbar>

            <v-card-subtitle class="pb-2">
                {{ almacenes.length }} almacenes registrados
            </v-card-subtitle>

            <v-divider />

            <v-card-text>
                <v-text-field
                    v-model="buscar"
                    class="mb-4"
                    clearable
                    density="comfortable"
                    hide-details
                    label="Buscar por nombre, código, sucursal o descripción"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                />

                <v-data-table
                    :headers="headers"
                    :items="almacenesFiltrados"
                    :loading="cargando"
                    hover
                    item-value="id"
                >
                    <template v-slot:item.codigo="{ item }">
                        <v-chip color="primary" size="small" variant="tonal">
                            {{ item.codigo }}
                        </v-chip>
                    </template>

                    <template v-slot:item.sucursal="{ item }">
                        {{ item.sucursal?.nombre || '—' }}
                    </template>

                    <template v-slot:item.descripcion="{ item }">
                        {{ item.descripcion || '—' }}
                    </template>

                    <template v-slot:item.created_at="{ item }">
                        {{ formatearFecha(item.created_at) }}
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <div class="d-flex ga-2 justify-end">
                            <v-btn
                                color="primary"
                                icon="mdi-pencil"
                                size="small"
                                variant="text"
                                @click="abrirEditar(item)"
                            />
                            <v-btn
                                color="error"
                                icon="mdi-delete"
                                size="small"
                                variant="text"
                                @click="abrirEliminar(item)"
                            />
                        </div>
                    </template>

                    <template v-slot:no-data>
                        <div class="py-6 text-center text-medium-emphasis">
                            <v-icon class="mb-2" icon="mdi-warehouse" size="40" />
                            <div>
                                {{
                                    buscar
                                        ? 'No se encontraron almacenes con ese criterio.'
                                        : 'No existen almacenes registrados.'
                                }}
                            </div>
                        </div>
                    </template>

                    <template v-slot:loading>
                        <v-skeleton-loader type="table-row@5" />
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>

        <!-- Crear / Editar -->
        <v-dialog v-model="dialog" max-width="600" persistent>
            <v-card rounded="lg">
                <v-card-title class="d-flex align-center ga-2">
                    <v-icon color="primary" icon="mdi-warehouse-cog" />
                    {{ form.id ? 'Editar almacén' : 'Nuevo almacén' }}
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-form ref="formRef" @submit.prevent="guardar">
                        <v-row dense>
                            <v-col cols="12" sm="7">
                                <v-text-field
                                    v-model="form.nombre"
                                    :error-messages="errores.nombre"
                                    label="Nombre"
                                    placeholder="Ej. Almacén Principal"
                                    prepend-inner-icon="mdi-warehouse"
                                    :rules="[obligatorio]"
                                    variant="outlined"
                                />
                            </v-col>

                            <v-col cols="12" sm="5">
                                <v-text-field
                                    v-model="form.codigo"
                                    :error-messages="errores.codigo"
                                    label="Código"
                                    placeholder="Ej. ALM-001"
                                    prepend-inner-icon="mdi-barcode"
                                    :rules="[obligatorio]"
                                    variant="outlined"
                                />
                            </v-col>

                            <v-col cols="12">
                                <v-select
                                    v-model="form.sucursal_id"
                                    :error-messages="errores.sucursal_id"
                                    item-title="nombre"
                                    item-value="id"
                                    :items="sucursales"
                                    label="Sucursal"
                                    prepend-inner-icon="mdi-store-marker"
                                    :rules="[obligatorio]"
                                    variant="outlined"
                                />
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

        <!-- Confirmar eliminación -->
        <v-dialog v-model="dialogEliminar" max-width="420">
            <v-card rounded="lg">
                <v-card-title class="d-flex align-center ga-2">
                    <v-icon color="error" icon="mdi-alert-circle-outline" />
                    Eliminar almacén
                </v-card-title>

                <v-divider />

                <v-card-text>
                    ¿Estás seguro de eliminar
                    <strong>{{ almacenAEliminar?.nombre }}</strong>?
                    Esta acción no se puede deshacer.
                </v-card-text>

                <v-card-actions class="pa-4">
                    <v-btn variant="text" @click="dialogEliminar = false">
                        Cancelar
                    </v-btn>

                    <v-spacer />

                    <v-btn
                        color="error"
                        :loading="eliminando"
                        prepend-icon="mdi-delete"
                        @click="confirmarEliminar"
                    >
                        Eliminar
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
import {
    funEliminar,
    funGuardar,
    funListar,
    funModificar,
} from '@/services/almacen.service';
import { funListar as funListarSucursales } from '@/services/sucursal.service';
import type { Almacen } from '@/services/interfaces/Almacen';
import type { Sucursal } from '@/services/interfaces/Sucursal';

const headers = [
    { title: 'ID', key: 'id', width: 70 },
    { title: 'CÓDIGO', key: 'codigo', width: 130 },
    { title: 'NOMBRE', key: 'nombre' },
    { title: 'SUCURSAL', key: 'sucursal' },
    { title: 'DESCRIPCIÓN', key: 'descripcion' },
    { title: 'REGISTRADO', key: 'created_at' },
    { title: 'ACCIONES', key: 'actions', align: 'end' as const, sortable: false },
];

const vacio = (): Almacen => ({
    id: 0,
    nombre: '',
    codigo: '',
    descripcion: '',
    sucursal_id: null,
});

const almacenes = ref<Almacen[]>([]);
const sucursales = ref<Sucursal[]>([]);
const buscar = ref('');
const cargando = ref(false);
const guardando = ref(false);
const eliminando = ref(false);

const dialog = ref(false);
const dialogEliminar = ref(false);
const formRef = ref<any>(null);
const form = ref<Almacen>(vacio());
const errores = ref<Record<string, string>>({});
const almacenAEliminar = ref<Almacen | null>(null);

const snackbar = ref({ visible: false, texto: '', color: 'success' });

const almacenesFiltrados = computed(() => {
    const texto = buscar.value?.trim().toLowerCase();
    if (!texto) return almacenes.value;

    return almacenes.value.filter((almacen) =>
        [
            almacen.nombre,
            almacen.codigo,
            almacen.descripcion,
            almacen.sucursal?.nombre,
        ].some((valor) => (valor ?? '').toLowerCase().includes(texto)),
    );
});

function obligatorio(valor: unknown) {
    return (valor !== null && valor !== undefined && String(valor).trim() !== '')
        || 'Este campo es obligatorio';
}

function formatearFecha(fecha?: string | null) {
    if (!fecha) return '—';

    const date = new Date(fecha.replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return fecha;

    return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
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

async function listarAlmacenes() {
    cargando.value = true;
    try {
        const { data } = await funListar();
        almacenes.value = data;
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        cargando.value = false;
    }
}

async function listarSucursales() {
    try {
        const { data } = await funListarSucursales();
        sucursales.value = data;
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    }
}

function abrirCrear() {
    form.value = vacio();
    errores.value = {};
    dialog.value = true;
}

function abrirEditar(almacen: Almacen) {
    form.value = { ...almacen };
    errores.value = {};
    dialog.value = true;
}

function cerrarDialogo() {
    dialog.value = false;
    form.value = vacio();
    errores.value = {};
}

async function guardar() {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    guardando.value = true;
    errores.value = {};

    try {
        const payload: Almacen = {
            nombre: form.value.nombre.trim(),
            codigo: form.value.codigo.trim(),
            descripcion: form.value.descripcion?.trim() || null,
            sucursal_id: form.value.sucursal_id,
        };

        if (form.value.id) {
            await funModificar(form.value.id, payload);
            notificar('Almacén actualizado correctamente.');
        } else {
            await funGuardar(payload);
            notificar('Almacén registrado correctamente.');
        }

        dialog.value = false;
        form.value = vacio();
        await listarAlmacenes();
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        guardando.value = false;
    }
}

function abrirEliminar(almacen: Almacen) {
    almacenAEliminar.value = almacen;
    dialogEliminar.value = true;
}

async function confirmarEliminar() {
    if (!almacenAEliminar.value?.id) return;

    eliminando.value = true;
    try {
        await funEliminar(almacenAEliminar.value.id);
        notificar('Almacén eliminado correctamente.');
        dialogEliminar.value = false;
        almacenAEliminar.value = null;
        await listarAlmacenes();
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        eliminando.value = false;
    }
}

onMounted(() => {
    listarAlmacenes();
    listarSucursales();
});
</script>
