import api from "./api";
import type { VentaPayload } from "./interfaces/Venta";

export interface FiltrosVenta {
    search?: string;
    desde?: string;
    hasta?: string;
}

export async function funListar(page: number = 1, limit: number = 10, filtros: FiltrosVenta = {}) {
    return await api.get("/venta", {
        params: {
            page,
            limit,
            search: filtros.search || undefined,
            desde: filtros.desde || undefined,
            hasta: filtros.hasta || undefined,
        },
    });
}

export async function funGuardar(venta: VentaPayload) {
    return await api.post("/venta", venta);
}

export async function funMostrar(id: number) {
    return await api.get(`/venta/${id}`);
}

export async function funGenerarPdf(id: number) {
    return await api.get(`/venta/${id}/generar-pdf`, {
        responseType: "blob",
    });
}

export async function funReportePdf(filtros: FiltrosVenta = {}) {
    return await api.get("/venta/reporte-pdf", {
        params: {
            search: filtros.search || undefined,
            desde: filtros.desde || undefined,
            hasta: filtros.hasta || undefined,
        },
        responseType: "blob",
    });
}
