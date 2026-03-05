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

export async function syncTransactions() {
    if (!navigator.onLine) return;

    const items = await db.unsyncedTransactions.orderBy('timestamp').toArray();
    if (items.length === 0) return;

    for (const item of items) {
        try {
            const formData = new FormData();
            formData.append('tipo', item.tipo);
            formData.append('monto', item.monto.toString());
            formData.append('descripcion', item.descripcion);
            formData.append('categoriaId', item.categoria_id?.toString() || '');
            if (item.server_id) formData.append('id', item.server_id.toString());

            if (item.action === 'create') {
                await addTransaction(formData);
            } else if (item.action === 'update') {
                await updateTransaction(formData);
            } else if (item.action === 'delete' && item.server_id) {
                await deleteTransaction(item.server_id);
            }

            // If success, remove from offline queue
            await db.unsyncedTransactions.delete(item.id!);
        } catch (error) {
            console.error('Failed to sync item:', item, error);
            // Stop and retry later to maintain order
            break;
        }
    }
}

export function useSyncManager() {
    useEffect(() => {
        window.addEventListener('online', syncTransactions);
        return () => window.removeEventListener('online', syncTransactions);
    }, []);
}
