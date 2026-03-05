'use client'

import { useState, useEffect } from 'react'
import TransactionModal from './TransactionModal'
import { Transaccion, Categoria } from '@/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

interface TransactionsManagerProps {
    txs: Transaccion[]
    categorias: Categoria[]
    userId: number
}

export default function TransactionsManager({ txs: initialTxs, categorias, userId }: TransactionsManagerProps) {
    const [localTxs, setLocalTxs] = useState<Transaccion[]>(initialTxs)
    const [editingTx, setEditingTx] = useState<Transaccion | null>(null)

    // Obtenemos los items de IndexedDB de forma reactiva
    const offlineItems = useLiveQuery(() => db.unsyncedTransactions.toArray())

    // Sincronizar localTxs con initialTxs + Datos Offline
    useEffect(() => {
        // Combinar initialTxs con items offline
        // Si un item offline es una edición (server_id), reemplazamos el original
        // Si es una creación (sin server_id), lo agregamos al principio
        // Si es una eliminación (action === delete), lo quitamos del listado

        let combined = [...initialTxs]

        if (offlineItems) {
            offlineItems.forEach(off => {
                if (off.action === 'create') {
                    // Evitar duplicar si el server ya lo envió (revalidación)
                    // Usamos una combinación de descripción y monto como clave temporal
                    const exists = combined.some(t => t.descripcion === off.descripcion && Number(t.monto) === off.monto && !t.isOffline)
                    if (!exists) {
                        combined.unshift({
                            id: off.id!, // ID local de Dexie
                            tipo: off.tipo,
                            monto: off.monto,
                            descripcion: off.descripcion,
                            categoria_id: off.categoria_id,
                            categoria: categorias.find(c => c.id === off.categoria_id) || null,
                            fecha: off.fecha,
                            userId: off.userId,
                            isOffline: true
                        } as Transaccion)
                    }
                } else if (off.action === 'update' && off.server_id) {
                    combined = combined.map(t => t.id === off.server_id ? {
                        ...t,
                        monto: off.monto,
                        descripcion: off.descripcion,
                        categoria_id: off.categoria_id,
                        categoria: categorias.find(c => c.id === off.categoria_id) || null,
                        tipo: off.tipo,
                        isOffline: true
                    } : t)
                } else if (off.action === 'delete' && off.server_id) {
                    combined = combined.filter(t => t.id !== off.server_id)
                }
            })
        }

        setLocalTxs(combined)
    }, [initialTxs, categorias, offlineItems])

    const handleEdit = (tx: Transaccion) => {
        setEditingTx(tx)
    }

    const onTransactionChange = (newTxs: Transaccion[]) => {
        setLocalTxs(newTxs)
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Modal para Creación (Estático en la parte inferior) */}
            <TransactionModal
                categorias={categorias}
                onTransactionChange={onTransactionChange}
                currentTxs={localTxs}
                userId={userId}
            />

            {/* Modal para Edición (Se activa cuando editingTx tiene valor) */}
            {editingTx && (
                <TransactionModal
                    categorias={categorias}
                    editTransactionData={editingTx}
                    onClose={() => setEditingTx(null)}
                    onTransactionChange={onTransactionChange}
                    currentTxs={localTxs}
                    userId={userId}
                />
            )}

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Movimientos Recientes
                </h3>
                <span className="text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full">{localTxs.length} total</span>
            </div>

            <div className="space-y-3 pb-8">
                {!localTxs.length ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl text-center border-2 border-dashed border-gray-200 dark:border-zinc-800">
                        <p className="text-gray-500 font-bold">Sin movimientos aún</p>
                        <p className="text-xs text-gray-400 mt-1 font-medium px-4">Añade tu primer registro arriba.</p>
                    </div>
                ) : (
                    localTxs.slice(0, 50).map(tx => {
                        const catName = tx.categoria?.nombre || (tx.tipo === 'Ingreso' ? 'Ingreso' : 'Gasto')
                        return (
                            <div
                                key={tx.id}
                                onClick={() => handleEdit(tx)}
                                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm flex items-center gap-4 transition-all hover:shadow-md cursor-pointer hover:border-blue-100 dark:hover:border-blue-900 group"
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 transition-transform group-hover:scale-110 ${tx.tipo === 'Ingreso'
                                    ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                                    : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                                    }`}>
                                    {tx.tipo === 'Ingreso' ? '+' : '-'}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate text-base capitalize">
                                        {catName}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate font-medium">
                                        {tx.descripcion || 'Sin descripción'}
                                    </p>
                                </div>

                                <div className={`font-black text-right pr-1 flex flex-col items-end gap-1 ${tx.tipo === 'Ingreso'
                                    ? 'text-green-600 dark:text-green-500'
                                    : 'text-gray-900 dark:text-gray-100'
                                    }`}>
                                    <div className="flex items-center gap-1.5">
                                        {(tx as any).isOffline && (
                                            <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full" title="Pendiente de sincronización">
                                                <svg className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tighter">Sync</span>
                                            </div>
                                        )}
                                        <span>{tx.tipo === 'Ingreso' ? '+' : '-'}${Number(tx.monto).toLocaleString('es-CO')}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
