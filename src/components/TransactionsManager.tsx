'use client'

import { useState } from 'react'
import TransactionModal from './TransactionModal'
import { Transaccion, Categoria } from '@/types'

interface TransactionsManagerProps {
    txs: Transaccion[]
    categorias: Categoria[]
}

export default function TransactionsManager({ txs, categorias }: TransactionsManagerProps) {
    const [editingTx, setEditingTx] = useState<Transaccion | null>(null)

    const handleEdit = (tx: Transaccion) => {
        setEditingTx(tx)
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Modal para Creación (Estático en la parte inferior) */}
            <TransactionModal categorias={categorias} />

            {/* Modal para Edición (Se activa cuando editingTx tiene valor) */}
            {editingTx && (
                <TransactionModal
                    categorias={categorias}
                    editTransactionData={editingTx}
                    onClose={() => setEditingTx(null)}
                />
            )}

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Movimientos Recientes
                </h3>
                <span className="text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full">{txs.length} total</span>
            </div>

            <div className="space-y-3 pb-8">
                {!txs.length ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl text-center border-2 border-dashed border-gray-200 dark:border-zinc-800">
                        <p className="text-gray-500 font-bold">Sin movimientos aún</p>
                        <p className="text-xs text-gray-400 mt-1 font-medium px-4">Añade tu primer registro arriba.</p>
                    </div>
                ) : (
                    txs.slice(0, 10).map(tx => {
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

                                <div className={`font-black text-right pr-1 ${tx.tipo === 'Ingreso'
                                    ? 'text-green-600 dark:text-green-500'
                                    : 'text-gray-900 dark:text-gray-100'
                                    }`}>
                                    {tx.tipo === 'Ingreso' ? '+' : '-'}${Number(tx.monto).toLocaleString('es-CO')}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
