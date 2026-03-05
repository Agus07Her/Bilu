'use client'

import { useEffect } from 'react';
import { db, UnsyncedTransaction } from "./db";
import { addTransaction, updateTransaction, deleteTransaction } from "@/app/actions";

export async function addOfflineTransaction(tx: Omit<UnsyncedTransaction, 'timestamp'>) {
    await db.unsyncedTransactions.add({
        ...tx,
        timestamp: Date.now()
    });
    // Trigger sync if possible
    syncTransactions();
}

export async function syncTransactions(onSuccess?: () => void): Promise<void> {
    if (!navigator.onLine) return;

    const items = await db.unsyncedTransactions.orderBy('timestamp').toArray();
    if (items.length === 0) return;

    console.log(`[Sync] Intentando sincronizar ${items.length} movimientos...`);
    let someSuccess = false;

    for (const item of items) {
        try {
            const formData = new FormData();
            formData.append('tipo', item.tipo);
            formData.append('monto', item.monto.toString());
            formData.append('descripcion', item.descripcion || '');
            formData.append('categoriaId', item.categoria_id?.toString() || '');

            if (item.server_id) {
                formData.append('id', item.server_id.toString());
            }

            console.log(`[Sync] Procesando ${item.action}:`, item);

            let result;
            if (item.action === 'create') {
                result = await addTransaction(formData);
            } else if (item.action === 'update') {
                result = await updateTransaction(formData);
            } else if (item.action === 'delete' && item.server_id) {
                result = await deleteTransaction(item.server_id);
            }

            if (result?.error) {
                throw new Error(result.error);
            }

            // Si tuvo éxito, eliminar de la cola local
            await db.unsyncedTransactions.delete(item.id!);
            console.log(`[Sync] Éxito: ${item.action} de ${item.tipo}`);
            someSuccess = true;
        } catch (error) {
            console.error('[Sync] Error al sincronizar elemento:', item, error);
            // Si hay un error, detenemos el proceso para no desordenar la base de datos
            break;
        }
    }

    if (someSuccess && onSuccess) {
        console.log('[Sync] Sincronización finalizada correctamente. Refrescando datos del servidor...');
        onSuccess();
    }
}

export function useSyncManager(onSuccess?: () => void) {
    useEffect(() => {
        const handler = () => syncTransactions(onSuccess);
        window.addEventListener('online', handler);
        return () => window.removeEventListener('online', handler);
    }, [onSuccess]);
}
