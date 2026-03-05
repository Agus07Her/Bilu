import Dexie, { type Table } from 'dexie';

export interface UnsyncedTransaction {
    id?: number; // Auto-increment for local
    server_id?: number; // Real DB ID if it's an update/delete
    tipo: string;
    monto: number;
    descripcion: string;
    categoria_id: number | null;
    fecha: Date;
    userId: number;
    action: 'create' | 'update' | 'delete';
    timestamp: number;
}

export class BiluDatabase extends Dexie {
    unsyncedTransactions!: Table<UnsyncedTransaction>;

    constructor() {
        super('BiluDB');
        this.version(1).stores({
            unsyncedTransactions: '++id, server_id, action, timestamp'
        });
    }
}

export const db = new BiluDatabase();
