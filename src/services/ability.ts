import {
    AbilityBuilder,
    createMongoAbility,
    type MongoAbility,
    type RawRuleOf,
} from '@casl/ability';

/**
 * Acciones que expone el backend en sus permisos "recurso.accion".
 * "manage" es la acción comodín de CASL para administradores.
 */
export type AppAction = 'ver' | 'crear' | 'editar' | 'eliminar' | 'manage';

/**
 * Sujetos (recursos) protegidos. Coinciden con los modelos del backend.
 */
export type AppSubject =
    | 'Categoria'
    | 'Producto'
    | 'Sucursal'
    | 'Almacen'
    | 'Cliente'
    | 'Proveedor'
    | 'Compra'
    | 'Venta'
    | 'Usuario'
    | 'Rol'
    | 'Permiso'
    | 'all';

export type AppAbility = MongoAbility<[AppAction, AppSubject]>;

/**
 * Traduce el nombre del recurso que envía el backend (minúsculas)
 * al sujeto tipado que usa CASL.
 */
const RECURSOS: Record<string, AppSubject> = {
    categoria: 'Categoria',
    producto: 'Producto',
    sucursal: 'Sucursal',
    almacen: 'Almacen',
    cliente: 'Cliente',
    proveedor: 'Proveedor',
    compra: 'Compra',
    venta: 'Venta',
    usuario: 'Usuario',
    rol: 'Rol',
    permiso: 'Permiso',
};

/**
 * Traduce la acción del backend a la acción de CASL.
 */
const ACCIONES: Record<string, AppAction> = {
    ver: 'ver',
    crear: 'crear',
    editar: 'editar',
    eliminar: 'eliminar',
};

/**
 * Convierte la lista plana de permisos del backend
 * (por ejemplo "venta.ver", "producto.editar") en reglas CASL.
 */
export function construirReglas(
    permisos: string[],
    esAdministrador = false,
): RawRuleOf<AppAbility>[] {
    const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (esAdministrador) {
        can('manage', 'all');
        return rules;
    }

    for (const permiso of permisos) {
        const [recurso, accion] = permiso.split('.');
        if (!recurso || !accion) continue;

        const subject = RECURSOS[recurso];
        const action = ACCIONES[accion];

        if (subject && action) {
            can(action, subject);
        }
    }

    return rules;
}

/**
 * Instancia única y reactiva que consume @casl/vue.
 * Se actualiza en sitio con ability.update(...) para que $can
 * se vuelva a evaluar cuando cambian los permisos.
 */
export const ability = createMongoAbility<AppAbility>([]);

export function actualizarAbility(permisos: string[], esAdministrador = false): void {
    ability.update(construirReglas(permisos, esAdministrador));
}

/**
 * Atajo para usar CASL fuera de plantillas (guards, stores, etc.).
 */
export function puede(action: AppAction, subject: AppSubject): boolean {
    return ability.can(action, subject);
}
