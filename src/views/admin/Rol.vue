<template>
    <v-container fluid class="py-6">
        <v-card rounded="lg" elevation="2">
            <!-- Encabezado -->
            <v-toolbar flat color="transparent">
                <v-icon class="ms-2" color="primary" icon="mdi-shield-account" />
                <v-toolbar-title class="text-h6 font-weight-bold">
                    Roles y Permisos
                </v-toolbar-title>

                <v-btn
                    v-if="tab === 'roles' && $can('crear', 'Rol')"
                    color="primary"
                    prepend-icon="mdi-plus"
                    rounded="lg"
                    @click="abrirCrearRol"
                >
                    Nuevo Rol
                </v-btn>

                <v-btn
                    v-if="tab === 'permisos' && $can('crear', 'Permiso')"
                    color="primary"
                    prepend-icon="mdi-plus"
                    rounded="lg"
                    @click="abrirCrearPermiso"
                >
                    Nuevo Permiso
                </v-btn>
            </v-toolbar>

            <v-tabs v-model="tab" color="primary" density="comfortable">
                <v-tab value="roles">
                    <v-icon start icon="mdi-shield-account-outline" />
                    Roles
                </v-tab>
                <v-tab value="permisos">
                    <v-icon start icon="mdi-key-variant" />
                    Permisos
                </v-tab>
            </v-tabs>

            <v-divider />

            <v-card-text>
                <v-window v-model="tab">
                    <!-- ==================== ROLES ==================== -->
                    <v-window-item value="roles">
                        <v-text-field
                            v-model="buscarRoles"
                            class="mb-4"
                            clearable
                            density="comfortable"
                            hide-details
                            label="Buscar rol por nombre o descripción"
                            prepend-inner-icon="mdi-magnify"
                            variant="outlined"
                            @update:model-value="onBuscarRoles"
                        />

                        <v-data-table-server
                            v-model:items-per-page="itemsPerPageRoles"
                            v-model:page="pageRoles"
                            :headers="headersRoles"
                            :items="roles"
                            :items-length="totalRoles"
                            :loading="cargandoRoles"
                            hover
                            item-value="id"
                        >
                            <template v-slot:item.descripcion="{ item }">
                                {{ item.descripcion || '—' }}
                            </template>

                            <template v-slot:item.permisos="{ item }">
                                <div v-if="item.permisos?.length" class="d-flex flex-wrap ga-1 py-1">
                                    <v-chip
                                        v-for="permiso in item.permisos.slice(0, 3)"
                                        :key="permiso.id"
                                        size="x-small"
                                        variant="tonal"
                                    >
                                        {{ permiso.nombre }}
                                    </v-chip>
                                    <v-chip
                                        v-if="item.permisos.length > 3"
                                        size="x-small"
                                        variant="tonal"
                                    >
                                        +{{ item.permisos.length - 3 }}
                                    </v-chip>
                                </div>
                                <span v-else class="text-caption text-medium-emphasis">
                                    Sin permisos
                                </span>
                            </template>

                            <template v-slot:item.users_count="{ item }">
                                <v-chip size="small" variant="tonal" color="primary">
                                    {{ item.users_count ?? 0 }}
                                </v-chip>
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <div class="d-flex ga-2 justify-end">
                                    <v-btn
                                        v-if="$can('editar', 'Rol')"
                                        color="primary"
                                        icon="mdi-pencil"
                                        size="small"
                                        variant="text"
                                        @click="abrirEditarRol(item)"
                                    />
                                    <v-btn
                                        v-if="$can('eliminar', 'Rol')"
                                        color="error"
                                        icon="mdi-delete"
                                        size="small"
                                        variant="text"
                                        @click="abrirEliminarRol(item)"
                                    />
                                </div>
                            </template>

                            <template v-slot:no-data>
                                <div class="py-6 text-center text-medium-emphasis">
                                    <v-icon class="mb-2" icon="mdi-shield-off-outline" size="40" />
                                    <div>
                                        {{
                                            buscarRoles
                                                ? 'No se encontraron roles con ese criterio.'
                                                : 'No existen roles registrados.'
                                        }}
                                    </div>
                                </div>
                            </template>

                            <template v-slot:loading>
                                <v-skeleton-loader type="table-row@5" />
                            </template>
                        </v-data-table-server>
                    </v-window-item>

                    <!-- ==================== PERMISOS ==================== -->
                    <v-window-item value="permisos">
                        <v-text-field
                            v-model="buscarPermisos"
                            class="mb-4"
                            clearable
                            density="comfortable"
                            hide-details
                            label="Buscar permiso por nombre o descripción"
                            prepend-inner-icon="mdi-magnify"
                            variant="outlined"
                        />

                        <v-data-table
                            :headers="headersPermisos"
                            :items="permisosFiltrados"
                            :loading="cargandoPermisos"
                            hover
                            item-value="id"
                        >
                            <template v-slot:item.descripcion="{ item }">
                                {{ item.descripcion || '—' }}
                            </template>

                            <template v-slot:item.roles_count="{ item }">
                                <v-chip size="small" variant="tonal" color="primary">
                                    {{ item.roles_count ?? 0 }}
                                </v-chip>
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <div class="d-flex ga-2 justify-end">
                                    <v-btn
                                        v-if="$can('editar', 'Permiso')"
                                        color="primary"
                                        icon="mdi-pencil"
                                        size="small"
                                        variant="text"
                                        @click="abrirEditarPermiso(item)"
                                    />
                                    <v-btn
                                        v-if="$can('eliminar', 'Permiso')"
                                        color="error"
                                        icon="mdi-delete"
                                        size="small"
                                        variant="text"
                                        @click="abrirEliminarPermiso(item)"
                                    />
                                </div>
                            </template>

                            <template v-slot:no-data>
                                <div class="py-6 text-center text-medium-emphasis">
                                    <v-icon class="mb-2" icon="mdi-key-remove" size="40" />
                                    <div>
                                        {{
                                            buscarPermisos
                                                ? 'No se encontraron permisos con ese criterio.'
                                                : 'No existen permisos registrados.'
                                        }}
                                    </div>
                                </div>
                            </template>

                            <template v-slot:loading>
                                <v-skeleton-loader type="table-row@5" />
                            </template>
                        </v-data-table>
                    </v-window-item>
                </v-window>
            </v-card-text>
        </v-card>

        <!-- ==================== DIALOGO ROL ==================== -->
        <v-dialog v-model="dialogRol" max-width="760" persistent>
            <v-card rounded="lg">
                <v-card-title class="d-flex align-center ga-2">
                    <v-icon color="primary" icon="mdi-shield-edit" />
                    {{ formRol.id ? 'Editar rol' : 'Nuevo rol' }}
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-form ref="formRolRef" @submit.prevent="guardarRol">
                        <v-row dense>
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model="formRol.nombre"
                                    :error-messages="erroresRol.nombre"
                                    label="Nombre del rol"
                                    prepend-inner-icon="mdi-shield-account"
                                    :rules="[obligatorio, maximo50]"
                                    variant="outlined"
                                />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model="formRol.descripcion"
                                    :error-messages="erroresRol.descripcion"
                                    label="Descripción (opcional)"
                                    prepend-inner-icon="mdi-text"
                                    variant="outlined"
                                />
                            </v-col>

                            <v-col cols="12">
                                <v-card variant="outlined" rounded="lg">
                                    <v-card-title class="d-flex align-center text-subtitle-2 py-2">
                                        <v-icon class="me-2" color="primary" icon="mdi-key-variant" size="small" />
                                        Permisos del rol
                                        <v-spacer />
                                        <v-chip size="small" variant="tonal" color="primary">
                                            {{ formRol.permisos.length }} seleccionados
                                        </v-chip>
                                    </v-card-title>

                                    <v-divider />

                                    <v-card-text class="permisos-scroll">
                                        <div v-if="permisosCatalogo.length" class="mb-3">
                                            <v-checkbox
                                                :indeterminate="algunosSeleccionados"
                                                :model-value="todosSeleccionados"
                                                density="compact"
                                                hide-details
                                                label="Seleccionar todos los permisos"
                                                @update:model-value="alternarTodos"
                                            />
                                        </div>

                                        <div
                                            v-for="(grupo, recurso) in permisosAgrupados"
                                            :key="recurso"
                                            class="mb-4"
                                        >
                                            <div class="d-flex align-center ga-2 mb-1">
                                                <span class="text-caption font-weight-bold text-uppercase text-primary">
                                                    {{ etiquetaRecurso(recurso) }}
                                                </span>
                                                <v-chip size="x-small" variant="tonal">
                                                    {{ seleccionadosDelGrupo(grupo) }}/{{ grupo.length }}
                                                </v-chip>
                                                <v-spacer />
                                                <v-btn
                                                    size="x-small"
                                                    variant="text"
                                                    @click="alternarGrupo(grupo)"
                                                >
                                                    {{
                                                        seleccionadosDelGrupo(grupo) === grupo.length
                                                            ? 'Quitar todos'
                                                            : 'Seleccionar todos'
                                                    }}
                                                </v-btn>
                                            </div>

                                            <v-row dense>
                                                <v-col
                                                    v-for="permiso in grupo"
                                                    :key="permiso.id"
                                                    cols="12"
                                                    sm="6"
                                                >
                                                    <v-checkbox
                                                        v-model="formRol.permisos"
                                                        density="compact"
                                                        hide-details
                                                        :value="permiso.id"
                                                    >
                                                        <template #label>
                                                            <div>
                                                                <div class="text-body-2">{{ permiso.nombre }}</div>
                                                                <div class="text-caption text-medium-emphasis">
                                                                    {{ permiso.descripcion || 'Sin descripción' }}
                                                                </div>
                                                            </div>
                                                        </template>
                                                    </v-checkbox>
                                                </v-col>
                                            </v-row>
                                        </div>

                                        <div v-if="!permisosCatalogo.length" class="text-caption text-medium-emphasis">
                                            No se pudieron cargar los permisos. Verifica que tu usuario tenga
                                            el permiso <strong>permiso.ver</strong>.
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-divider />

                <v-card-actions class="pa-4">
                    <v-btn variant="text" @click="cerrarDialogoRol">Cancelar</v-btn>
                    <v-spacer />
                    <v-btn
                        v-if="$can(formRol.id ? 'editar' : 'crear', 'Rol')"
                        color="primary"
                        :loading="guardandoRol"
                        prepend-icon="mdi-content-save"
                        @click="guardarRol"
                    >
                        {{ formRol.id ? 'Actualizar' : 'Guardar' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- ==================== DIALOGO PERMISO ==================== -->
        <v-dialog v-model="dialogPermiso" max-width="520" persistent>
            <v-card rounded="lg">
                <v-card-title class="d-flex align-center ga-2">
                    <v-icon color="primary" icon="mdi-key-plus" />
                    {{ formPermiso.id ? 'Editar permiso' : 'Nuevo permiso' }}
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-form ref="formPermisoRef" @submit.prevent="guardarPermiso">
                        <v-row dense>
                            <v-col cols="12">
                                <v-text-field
                                    v-model="formPermiso.nombre"
                                    :error-messages="erroresPermiso.nombre"
                                    hint="Formato recurso.accion, por ejemplo: venta.ver"
                                    label="Nombre del permiso"
                                    persistent-hint
                                    prepend-inner-icon="mdi-key"
                                    :rules="[obligatorio, formatoPermiso]"
                                    variant="outlined"
                                />
                            </v-col>

                            <v-col cols="12">
                                <v-text-field
                                    v-model="formPermiso.descripcion"
                                    :error-messages="erroresPermiso.descripcion"
                                    label="Descripción (opcional)"
                                    prepend-inner-icon="mdi-text"
                                    variant="outlined"
                                />
                            </v-col>
                        </v-row>

                        <v-alert
                            class="mt-2"
                            density="compact"
                            type="info"
                            variant="tonal"
                        >
                            El frontend solo reconoce permisos de recursos y acciones del sistema
                            (categoria, producto, sucursal, almacen, cliente, proveedor, compra,
                            venta, usuario, rol, permiso).
                        </v-alert>
                    </v-form>
                </v-card-text>

                <v-divider />

                <v-card-actions class="pa-4">
                    <v-btn variant="text" @click="cerrarDialogoPermiso">Cancelar</v-btn>
                    <v-spacer />
                    <v-btn
                        v-if="$can(formPermiso.id ? 'editar' : 'crear', 'Permiso')"
                        color="primary"
                        :loading="guardandoPermiso"
                        prepend-icon="mdi-content-save"
                        @click="guardarPermiso"
                    >
                        {{ formPermiso.id ? 'Actualizar' : 'Guardar' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- ==================== ELIMINAR ROL ==================== -->
        <v-dialog v-model="dialogEliminarRol" max-width="420">
            <v-card rounded="lg">
                <v-card-title class="d-flex align-center ga-2">
                    <v-icon color="error" icon="mdi-alert-circle-outline" />
                    Eliminar rol
                </v-card-title>

                <v-divider />

                <v-card-text>
                    ¿Estás seguro de eliminar el rol
                    <strong>{{ rolAEliminar?.nombre }}</strong>?
                    Se quitarán sus permisos y la asignación a los usuarios.
                </v-card-text>

                <v-card-actions class="pa-4">
                    <v-btn variant="text" @click="dialogEliminarRol = false">Cancelar</v-btn>
                    <v-spacer />
                    <v-btn
                        color="error"
                        :loading="eliminandoRol"
                        prepend-icon="mdi-delete"
                        @click="confirmarEliminarRol"
                    >
                        Eliminar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- ==================== ELIMINAR PERMISO ==================== -->
        <v-dialog v-model="dialogEliminarPermiso" max-width="420">
            <v-card rounded="lg">
                <v-card-title class="d-flex align-center ga-2">
                    <v-icon color="error" icon="mdi-alert-circle-outline" />
                    Eliminar permiso
                </v-card-title>

                <v-divider />

                <v-card-text>
                    ¿Estás seguro de eliminar el permiso
                    <strong>{{ permisoAEliminar?.nombre }}</strong>?
                    Se quitará de todos los roles que lo tengan asignado.
                </v-card-text>

                <v-card-actions class="pa-4">
                    <v-btn variant="text" @click="dialogEliminarPermiso = false">Cancelar</v-btn>
                    <v-spacer />
                    <v-btn
                        color="error"
                        :loading="eliminandoPermiso"
                        prepend-icon="mdi-delete"
                        @click="confirmarEliminarPermiso"
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
import { computed, onMounted, ref, watch } from 'vue';
import {
    funEliminar as funEliminarRol,
    funGuardar as funGuardarRol,
    funListar as funListarRoles,
    funModificar as funModificarRol,
} from '@/services/rol.service';
import {
    funEliminar as funEliminarPermiso,
    funGuardar as funGuardarPermiso,
    funListar as funListarPermisos,
    funModificar as funModificarPermiso,
} from '@/services/permiso.service';
import type { Rol } from '@/services/interfaces/Rol';
import type { Permiso } from '@/services/interfaces/Permiso';
import { useAuthStore } from '@/stores/auth';

interface RolForm {
    id: number;
    nombre: string;
    descripcion: string;
    permisos: number[];
}

interface PermisoForm {
    id: number;
    nombre: string;
    descripcion: string;
}

const auth = useAuthStore();

const tab = ref<'roles' | 'permisos'>('roles');

const headersRoles = [
    { title: 'ID', key: 'id', width: 70 },
    { title: 'NOMBRE', key: 'nombre' },
    { title: 'DESCRIPCIÓN', key: 'descripcion' },
    { title: 'PERMISOS', key: 'permisos', sortable: false },
    { title: 'USUARIOS', key: 'users_count', width: 110 },
    { title: 'ACCIONES', key: 'actions', align: 'end' as const, sortable: false },
];

const headersPermisos = [
    { title: 'ID', key: 'id', width: 70 },
    { title: 'NOMBRE', key: 'nombre' },
    { title: 'DESCRIPCIÓN', key: 'descripcion' },
    { title: 'ROLES', key: 'roles_count', width: 100 },
    { title: 'ACCIONES', key: 'actions', align: 'end' as const, sortable: false },
];

/* -------------------- Roles (paginado en servidor) -------------------- */
const roles = ref<Rol[]>([]);
const totalRoles = ref(0);
const pageRoles = ref(1);
const itemsPerPageRoles = ref(10);
const buscarRoles = ref('');
const cargandoRoles = ref(false);
let timerRoles: ReturnType<typeof setTimeout> | undefined;

/* -------------------- Permisos (catálogo completo) -------------------- */
const permisosCatalogo = ref<Permiso[]>([]);
const buscarPermisos = ref('');
const cargandoPermisos = ref(false);

const permisosFiltrados = computed(() => {
    const texto = buscarPermisos.value?.trim().toLowerCase();
    if (!texto) return permisosCatalogo.value;

    return permisosCatalogo.value.filter((permiso) =>
        [permiso.nombre, permiso.descripcion]
            .some((valor) => (valor ?? '').toLowerCase().includes(texto)),
    );
});

const permisosAgrupados = computed(() => {
    const grupos: Record<string, Permiso[]> = {};

    for (const permiso of permisosCatalogo.value) {
        const recurso = permiso.nombre.split('.')[0] ?? 'otros';
        (grupos[recurso] ??= []).push(permiso);
    }

    for (const grupo of Object.values(grupos)) {
        grupo.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    return grupos;
});

/* -------------------- Diálogos y formularios -------------------- */
const dialogRol = ref(false);
const dialogPermiso = ref(false);
const dialogEliminarRol = ref(false);
const dialogEliminarPermiso = ref(false);

const formRolRef = ref<any>(null);
const formPermisoRef = ref<any>(null);

const formRol = ref<RolForm>(vacioRol());
const formPermiso = ref<PermisoForm>(vacioPermiso());

const erroresRol = ref<Record<string, string>>({});
const erroresPermiso = ref<Record<string, string>>({});

const guardandoRol = ref(false);
const guardandoPermiso = ref(false);
const eliminandoRol = ref(false);
const eliminandoPermiso = ref(false);

const rolAEliminar = ref<Rol | null>(null);
const permisoAEliminar = ref<Permiso | null>(null);

const snackbar = ref({ visible: false, texto: '', color: 'success' });

function vacioRol(): RolForm {
    return { id: 0, nombre: '', descripcion: '', permisos: [] };
}

function vacioPermiso(): PermisoForm {
    return { id: 0, nombre: '', descripcion: '' };
}

/* -------------------- Reglas de validación -------------------- */
function obligatorio(valor: unknown) {
    return !!String(valor ?? '').trim() || 'Este campo es obligatorio';
}

function maximo50(valor: unknown) {
    return String(valor ?? '').length <= 50 || 'Máximo 50 caracteres';
}

function formatoPermiso(valor: unknown) {
    return (
        /^[a-z0-9_]+\.[a-z0-9_]+$/.test(String(valor ?? '')) ||
        'Usa el formato recurso.accion (ej. venta.ver)'
    );
}

/* -------------------- Utilidades -------------------- */
function notificar(texto: string, color = 'success') {
    snackbar.value = { visible: true, texto, color };
}

function extraerErrores(error: any, tipo: 'rol' | 'permiso') {
    const destino = tipo === 'rol' ? erroresRol : erroresPermiso;
    destino.value = {};

    const campos = error?.response?.data?.errors ?? {};
    for (const [campo, mensajes] of Object.entries(campos)) {
        destino.value[campo] = (mensajes as string[])[0] ?? 'Valor inválido';
    }

    return (
        error?.response?.data?.message ??
        error?.response?.data?.mensaje ??
        'Ocurrió un error inesperado.'
    );
}

function etiquetaRecurso(recurso: string) {
    return recurso.charAt(0).toUpperCase() + recurso.slice(1);
}

/* -------------------- Carga de datos -------------------- */
async function cargarRoles() {
    cargandoRoles.value = true;
    try {
        const { data } = await funListarRoles({
            page: pageRoles.value,
            limit: itemsPerPageRoles.value,
            search: buscarRoles.value || undefined,
        });
        roles.value = Array.isArray(data) ? data : (data?.data ?? []);
        totalRoles.value = Array.isArray(data) ? data.length : (data?.total ?? 0);
    } catch (error) {
        roles.value = [];
        totalRoles.value = 0;
        notificar(extraerErrores(error, 'rol'), 'error');
    } finally {
        cargandoRoles.value = false;
    }
}

async function cargarPermisosCatalogo() {
    if (!auth.can('ver', 'Permiso')) return;

    cargandoPermisos.value = true;
    try {
        const { data } = await funListarPermisos({ limit: 200 });
        permisosCatalogo.value = Array.isArray(data) ? data : (data?.data ?? []);
    } catch (error) {
        permisosCatalogo.value = [];
        notificar(extraerErrores(error, 'permiso'), 'error');
    } finally {
        cargandoPermisos.value = false;
    }
}

function onBuscarRoles(valor: string | null) {
    buscarRoles.value = valor ?? '';
    clearTimeout(timerRoles);
    timerRoles = setTimeout(() => {
        pageRoles.value = 1;
        cargarRoles();
    }, 400);
}

watch(pageRoles, () => cargarRoles());
watch(itemsPerPageRoles, () => {
    pageRoles.value = 1;
    cargarRoles();
});

/* -------------------- Selección de permisos -------------------- */
const todosSeleccionados = computed(
    () =>
        permisosCatalogo.value.length > 0 &&
        formRol.value.permisos.length === permisosCatalogo.value.length,
);

const algunosSeleccionados = computed(
    () => formRol.value.permisos.length > 0 && !todosSeleccionados.value,
);

function alternarTodos(valor: boolean | null) {
    formRol.value.permisos = valor
        ? permisosCatalogo.value
              .map((permiso) => permiso.id)
              .filter((id): id is number => typeof id === 'number')
        : [];
}

function seleccionadosDelGrupo(grupo: Permiso[]) {
    return grupo.filter(
        (permiso) =>
            typeof permiso.id === 'number' &&
            formRol.value.permisos.includes(permiso.id),
    ).length;
}

function alternarGrupo(grupo: Permiso[]) {
    const ids = grupo
        .map((permiso) => permiso.id)
        .filter((id): id is number => typeof id === 'number');

    const todos = ids.every((id) => formRol.value.permisos.includes(id));

    formRol.value.permisos = todos
        ? formRol.value.permisos.filter((id) => !ids.includes(id))
        : Array.from(new Set([...formRol.value.permisos, ...ids]));
}

/* -------------------- CRUD roles -------------------- */
function abrirCrearRol() {
    formRol.value = vacioRol();
    erroresRol.value = {};
    dialogRol.value = true;
}

function abrirEditarRol(rol: Rol) {
    formRol.value = {
        id: rol.id ?? 0,
        nombre: rol.nombre,
        descripcion: rol.descripcion ?? '',
        permisos: (rol.permisos ?? [])
            .map((permiso) => permiso.id)
            .filter((id): id is number => typeof id === 'number'),
    };
    erroresRol.value = {};
    dialogRol.value = true;
}

function cerrarDialogoRol() {
    dialogRol.value = false;
    formRol.value = vacioRol();
    erroresRol.value = {};
}

async function guardarRol() {
    const { valid } = await formRolRef.value.validate();
    if (!valid) return;

    guardandoRol.value = true;
    erroresRol.value = {};

    try {
        const payload = {
            nombre: formRol.value.nombre.trim(),
            descripcion: formRol.value.descripcion.trim() || null,
            permisos: formRol.value.permisos,
        };

        if (formRol.value.id) {
            await funModificarRol(formRol.value.id, payload);
            notificar('Rol actualizado correctamente.');
        } else {
            await funGuardarRol(payload);
            notificar('Rol registrado correctamente.');
        }

        dialogRol.value = false;
        formRol.value = vacioRol();
        await cargarRoles();
    } catch (error) {
        notificar(extraerErrores(error, 'rol'), 'error');
    } finally {
        guardandoRol.value = false;
    }
}

function abrirEliminarRol(rol: Rol) {
    rolAEliminar.value = rol;
    dialogEliminarRol.value = true;
}

async function confirmarEliminarRol() {
    if (!rolAEliminar.value?.id) return;

    eliminandoRol.value = true;
    try {
        await funEliminarRol(rolAEliminar.value.id);
        notificar('Rol eliminado correctamente.');
        dialogEliminarRol.value = false;
        rolAEliminar.value = null;
        await cargarRoles();
    } catch (error) {
        notificar(extraerErrores(error, 'rol'), 'error');
    } finally {
        eliminandoRol.value = false;
    }
}

/* -------------------- CRUD permisos -------------------- */
function abrirCrearPermiso() {
    formPermiso.value = vacioPermiso();
    erroresPermiso.value = {};
    dialogPermiso.value = true;
}

function abrirEditarPermiso(permiso: Permiso) {
    formPermiso.value = {
        id: permiso.id ?? 0,
        nombre: permiso.nombre,
        descripcion: permiso.descripcion ?? '',
    };
    erroresPermiso.value = {};
    dialogPermiso.value = true;
}

function cerrarDialogoPermiso() {
    dialogPermiso.value = false;
    formPermiso.value = vacioPermiso();
    erroresPermiso.value = {};
}

async function guardarPermiso() {
    const { valid } = await formPermisoRef.value.validate();
    if (!valid) return;

    guardandoPermiso.value = true;
    erroresPermiso.value = {};

    try {
        const payload = {
            nombre: formPermiso.value.nombre.trim(),
            descripcion: formPermiso.value.descripcion.trim() || null,
        };

        if (formPermiso.value.id) {
            await funModificarPermiso(formPermiso.value.id, payload);
            notificar('Permiso actualizado correctamente.');
        } else {
            await funGuardarPermiso(payload);
            notificar('Permiso registrado correctamente.');
        }

        dialogPermiso.value = false;
        formPermiso.value = vacioPermiso();
        await Promise.all([cargarPermisosCatalogo(), cargarRoles()]);
    } catch (error) {
        notificar(extraerErrores(error, 'permiso'), 'error');
    } finally {
        guardandoPermiso.value = false;
    }
}

function abrirEliminarPermiso(permiso: Permiso) {
    permisoAEliminar.value = permiso;
    dialogEliminarPermiso.value = true;
}

async function confirmarEliminarPermiso() {
    if (!permisoAEliminar.value?.id) return;

    eliminandoPermiso.value = true;
    try {
        await funEliminarPermiso(permisoAEliminar.value.id);
        notificar('Permiso eliminado correctamente.');
        dialogEliminarPermiso.value = false;
        permisoAEliminar.value = null;
        await Promise.all([cargarPermisosCatalogo(), cargarRoles()]);
    } catch (error) {
        notificar(extraerErrores(error, 'permiso'), 'error');
    } finally {
        eliminandoPermiso.value = false;
    }
}

onMounted(() => {
    cargarRoles();
    cargarPermisosCatalogo();
});
</script>

<style scoped>
.permisos-scroll {
    max-height: 340px;
    overflow-y: auto;
}
</style>
