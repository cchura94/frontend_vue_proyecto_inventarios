<template>
    <v-container fluid class="py-6">
        <v-card rounded="lg" elevation="2">
            <!-- Encabezado -->
            <v-toolbar flat color="transparent">
                <v-icon class="ms-2" color="primary" icon="mdi-store-marker" />
                <v-toolbar-title class="text-h6 font-weight-bold">
                    Gestión de Sucursales
                </v-toolbar-title>

                <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    rounded="lg"
                    @click="abrirCrear"
                >
                    Nueva Sucursal
                </v-btn>
            </v-toolbar>

            <v-card-subtitle class="pb-2">
                {{ sucursales.length }} sucursales registradas
            </v-card-subtitle>

            <v-divider />

            <v-card-text>
                <v-text-field
                    v-model="buscar"
                    class="mb-4"
                    clearable
                    density="comfortable"
                    hide-details
                    label="Buscar por nombre, ciudad, dirección o teléfono"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                />

                <v-data-table
                    :headers="headers"
                    :items="sucursalesFiltradas"
                    :loading="cargando"
                    hover
                    item-value="id"
                >
                    <template v-slot:item.telefono="{ item }">
                        {{ item.telefono || '—' }}
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
                            <v-icon class="mb-2" icon="mdi-store-off-outline" size="40" />
                            <div>
                                {{
                                    buscar
                                        ? 'No se encontraron sucursales con ese criterio.'
                                        : 'No existen sucursales registradas.'
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
                    <v-icon color="primary" icon="mdi-store-edit-outline" />
                    {{ form.id ? 'Editar sucursal' : 'Nueva sucursal' }}
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-form ref="formRef" @submit.prevent="guardar">
                        <v-row dense>
                            <v-col cols="12">
                                <v-text-field
                                    v-model="form.nombre"
                                    :error-messages="errores.nombre"
                                    label="Nombre"
                                    placeholder="Ej. Sucursal Central"
                                    prepend-inner-icon="mdi-store"
                                    :rules="[obligatorio]"
                                    variant="outlined"
                                />
                            </v-col>

                            <v-col cols="12">
                                <v-text-field
                                    v-model="form.direccion"
                                    :error-messages="errores.direccion"
                                    label="Dirección"
                                    placeholder="Ej. Av. Mariscal Santa Cruz #1234"
                                    prepend-inner-icon="mdi-map-marker"
                                    :rules="[obligatorio]"
                                    variant="outlined"
                                />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model="form.ciudad"
                                    :error-messages="errores.ciudad"
                                    label="Ciudad"
                                    placeholder="Ej. La Paz"
                                    prepend-inner-icon="mdi-city"
                                    :rules="[obligatorio]"
                                    variant="outlined"
                                />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model="form.telefono"
                                    :error-messages="errores.telefono"
                                    label="Teléfono"
                                    placeholder="Ej. 22123456"
                                    prepend-inner-icon="mdi-phone"
                                    :rules="[obligatorio]"
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
                    Eliminar sucursal
                </v-card-title>

                <v-divider />

                <v-card-text>
                    ¿Estás seguro de eliminar
                    <strong>{{ sucursalAEliminar?.nombre }}</strong>?
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
} from '@/services/sucursal.service';
import type { Sucursal } from '@/services/interfaces/Sucursal';

const headers = [
    { title: 'ID', key: 'id', width: 70 },
    { title: 'NOMBRE', key: 'nombre' },
    { title: 'CIUDAD', key: 'ciudad' },
    { title: 'DIRECCIÓN', key: 'direccion' },
    { title: 'TELÉFONO', key: 'telefono' },
    { title: 'REGISTRADO', key: 'created_at' },
    { title: 'ACCIONES', key: 'actions', align: 'end' as const, sortable: false },
];

const vacio = (): Sucursal => ({
    id: 0,
    nombre: '',
    direccion: '',
    telefono: '',
    ciudad: '',
});

const sucursales = ref<Sucursal[]>([]);
const buscar = ref('');
const cargando = ref(false);
const guardando = ref(false);
const eliminando = ref(false);

const dialog = ref(false);
const dialogEliminar = ref(false);
const formRef = ref<any>(null);
const form = ref<Sucursal>(vacio());
const errores = ref<Record<string, string>>({});
const sucursalAEliminar = ref<Sucursal | null>(null);

const snackbar = ref({ visible: false, texto: '', color: 'success' });

const sucursalesFiltradas = computed(() => {
    const texto = buscar.value?.trim().toLowerCase();
    if (!texto) return sucursales.value;

    return sucursales.value.filter((sucursal) =>
        [sucursal.nombre, sucursal.ciudad, sucursal.direccion, sucursal.telefono]
            .some((valor) => (valor ?? '').toLowerCase().includes(texto)),
    );
});

function obligatorio(valor: unknown) {
    return !!String(valor ?? '').trim() || 'Este campo es obligatorio';
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

async function listarSucursales() {
    cargando.value = true;
    try {
        const { data } = await funListar();
        sucursales.value = data;
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        cargando.value = false;
    }
}

function abrirCrear() {
    form.value = vacio();
    errores.value = {};
    dialog.value = true;
}

function abrirEditar(sucursal: Sucursal) {
    form.value = { ...sucursal };
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
        const payload: Sucursal = {
            nombre: form.value.nombre.trim(),
            direccion: form.value.direccion.trim(),
            telefono: form.value.telefono.trim(),
            ciudad: form.value.ciudad.trim(),
        };

        if (form.value.id) {
            await funModificar(form.value.id, payload);
            notificar('Sucursal actualizada correctamente.');
        } else {
            await funGuardar(payload);
            notificar('Sucursal registrada correctamente.');
        }

        dialog.value = false;
        form.value = vacio();
        await listarSucursales();
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        guardando.value = false;
    }
}

function abrirEliminar(sucursal: Sucursal) {
    sucursalAEliminar.value = sucursal;
    dialogEliminar.value = true;
}

async function confirmarEliminar() {
    if (!sucursalAEliminar.value?.id) return;

    eliminando.value = true;
    try {
        await funEliminar(sucursalAEliminar.value.id);
        notificar('Sucursal eliminada correctamente.');
        dialogEliminar.value = false;
        sucursalAEliminar.value = null;
        await listarSucursales();
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        eliminando.value = false;
    }
}

onMounted(listarSucursales);
</script>
