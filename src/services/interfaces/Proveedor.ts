export interface Proveedor {
    id?: number;
    razon_social: string;
    nro_identificacion?: string | null;
    contacto?: string | null;
    telefono?: string | null;
    correo?: string | null;
    observaciones?: string | null;
    estado?: boolean;
    created_at?: string | null;
    updated_at?: string | null;
}
