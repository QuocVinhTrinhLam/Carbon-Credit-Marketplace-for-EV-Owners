// src/services/uploadService.ts
import { api } from "./api";

/**
 * uploadService - handle uploads (driving data, evidence files, ...)
 */

// SỬA: Bổ sung các trường 'id' và 'co2_reduction_kg'
export type UploadResponse = {
    id: string; // <-- Đã thêm
    co2_reduction_kg: number; // <-- Đã thêm
    message?: string;
    fileId?: number | string;
    metadata?: Record<string, any>;
};

export const uploadService = {
    /**
     * Upload driving data file
     * @param file File
     * @param options { userId?: string|number, vehicleId?: string|number, tripDate?: string }
     * @param onProgress optional progress callback (0-100)
     */
    async uploadDrivingData(
        file: File,
        options?: { userId?: string | number; vehicleId?: string | number; tripDate?: string },
        onProgress?: (percent: number) => void
    ): Promise<UploadResponse> {
        const form = new FormData();
        form.append("file", file);
        if (options?.userId !== undefined) form.append("userId", String(options.userId));
        if (options?.vehicleId !== undefined) form.append("vehicleId", String(options.vehicleId));
        if (options?.tripDate !== undefined) form.append("tripDate", String(options.tripDate));

        const url = "/upload/driving-data";

        try {
            const { data } = await api.post<UploadResponse>(url, form, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                onUploadProgress: (e) => {
                    if (!e.total) return;
                    const percent = Math.round((e.loaded * 100) / e.total);
                    if (onProgress) onProgress(percent);
                }
            });

            return data;
        } catch (err) {
            console.error("uploadDrivingData error", err);
            throw err;
        }
    },

    /**
     * Reuse for existing evidence upload endpoint (if needed)
     */
    async uploadEvidenceForRequest(
        requestId: number | string,
        userId: number | string,
        file: File,
        onProgress?: (percent: number) => void
    ) {
        const form = new FormData();
        form.append("file", file);

        try {
            const { data } = await api.post<string>(`/upload/request/${requestId}`, form, {
                params: { userId },
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (e) => {
                    if (!e.total) return;
                    const percent = Math.round((e.loaded * 100) / e.total);
                    if (onProgress) onProgress(percent);
                }
            });
            return data;
        } catch (err) {
            console.error("uploadEvidenceForRequest error", err);
            throw err;
        }
    }
};