'use client'

import { useState, useEffect } from 'react'
import { addTransaction, updateTransaction, deleteTransaction } from '@/app/actions'
import ConfirmDialog from './ConfirmDialog'

import { Transaccion, Categoria } from '@/types'

import { addOfflineTransaction } from '@/lib/syncService'

interface TransactionModalProps {
    categorias: Categoria[]
    editTransactionData?: Transaccion | null
    onClose?: () => void
    onTransactionChange?: (newTxs: Transaccion[]) => void
    currentTxs?: Transaccion[]
    userId: number
}

export default function TransactionModal({ categorias, editTransactionData, onClose, onTransactionChange, currentTxs, userId }: TransactionModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [tipo, setTipo] = useState<'Ingreso' | 'Gasto'>('Ingreso')
    const [montoInput, setMontoInput] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [categoriaId, setCategoriaId] = useState('')
    const [editingId, setEditingId] = useState<number | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

    // Sincronizar con editTransactionData cuando cambia
    useEffect(() => {
        if (editTransactionData) {
            setTipo(editTransactionData.tipo as 'Ingreso' | 'Gasto')
            setMontoInput(Number(editTransactionData.monto).toLocaleString('es-CO'))
            setDescripcion(editTransactionData.descripcion || '')
            setCategoriaId(editTransactionData.categoria_id?.toString() || '')
            setEditingId(editTransactionData.id)
            setIsOpen(true)
        }
    }, [editTransactionData])

    const openModal = (t: 'Ingreso' | 'Gasto') => {
        setEditingId(null)
        setTipo(t)
        setMontoInput('')
        setDescripcion('')
        setCategoriaId('')
        setIsOpen(true)
    }

    const closeModal = () => {
        setIsOpen(false)
        if (onClose) onClose()
    }

    const actionWithClose = async (formData: FormData) => {
        // --- Optimistic UI Update ---
        const amount = parseFloat(montoInput.replace(/\./g, '').replace(',', '.'))
        const catIdInt = categoriaId ? parseInt(categoriaId) : null

        // Creamos una copia de las txs actuales y la actualizamos localmente al instante
        if (currentTxs && onTransactionChange) {
            let nextTxs = [...currentTxs]

            if (editingId) {
                // Modo Edición Optimista
                nextTxs = nextTxs.map(t => t.id === editingId ? {
                    ...t,
                    monto: amount,
                    descripcion: descripcion,
                    categoria_id: catIdInt,
                    categoria: categorias.find(c => c.id === catIdInt) || null,
                    tipo: tipo,
                    isOffline: true
                } : t)
            } else {
                // Modo Creación Optimista (ID temporal basado en timestamp)
                const tempTx: Transaccion = {
                    id: Date.now(), // ID temporal
                    tipo,
                    monto: amount,
                    descripcion,
                    categoria_id: catIdInt,
                    categoria: categorias.find(c => c.id === catIdInt) || null,
                    fecha: new Date(),
                    userId: userId,
                    isOffline: true
                }
                nextTxs = [tempTx, ...nextTxs]
            }
            onTransactionChange(nextTxs)
        }

        // Cerramos el modal de una vez para dar el feeling de rapidez (Optimista)
        closeModal()

        // --- Intento de Sincronización ---
        try {
            const serverFormData = new FormData();
            serverFormData.set('monto', amount.toString());
            serverFormData.set('descripcion', descripcion);
            serverFormData.set('categoriaId', (catIdInt || '').toString());
            serverFormData.set('tipo', tipo);

            if (editingId) {
                serverFormData.append('id', editingId.toString());
                const res = await updateTransaction(serverFormData);
                if (res?.error) throw new Error(res.error);
            } else {
                const res = await addTransaction(serverFormData);
                if (res?.error) throw new Error(res.error);
            }
        } catch (error) {
            console.warn("Sin conexión o error de servidor. Guardando en modo Offline local.", error);

            // Si el servidor falla (ej. sin internet), lo metemos en la cola de Dexie
            await addOfflineTransaction({
                server_id: editingId || undefined,
                tipo,
                monto: amount,
                descripcion,
                categoria_id: catIdInt,
                fecha: new Date(),
                userId,
                action: editingId ? 'update' : 'create'
            });
        }
    }

    const handleDelete = async () => {
        if (!editingId) return
        setShowDeleteConfirm(true)
    }

    const confirmDelete = async () => {
        if (!editingId) return

        // --- Optimistic UI Update ---
        if (currentTxs && onTransactionChange) {
            const nextTxs = currentTxs.filter(t => t.id !== editingId)
            onTransactionChange(nextTxs)
        }

        setShowDeleteConfirm(false)
        closeModal()

        // --- Intento de Sincronización ---
        try {
            const res = await deleteTransaction(editingId)
            if (res?.error) throw new Error(res.error)
        } catch (error) {
            console.warn("Sin conexión. Guardando eliminación en modo Offline.", error)
            await addOfflineTransaction({
                server_id: editingId,
                tipo,
                monto: parseFloat(montoInput.replace(/\./g, '')),
                descripcion,
                categoria_id: categoriaId ? parseInt(categoriaId) : null,
                fecha: new Date(),
                userId,
                action: 'delete'
            })
        }
    }

    return (
        <>
            {/* Solo mostramos los botones de creación si no estamos editando (cuando se usa como componente estático) */}
            {!editTransactionData && (
                <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 dark:to-transparent backdrop-blur-sm z-20 sm:relative sm:bg-none sm:backdrop-blur-none sm:p-0 sm:pb-0 sm:mb-6">
                    <div className="max-w-md mx-auto flex gap-4 w-full justify-between items-center">
                        <button
                            onClick={() => openModal('Ingreso')}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                            Ingreso
                        </button>
                        <button
                            onClick={() => openModal('Gasto')}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                            Gasto
                        </button>
                    </div>
                </div>
            )}

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-[200] animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-950 rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 sm:p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-300 border border-white/5">
                        <button
                            onClick={closeModal}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        <h2 className={`text-2xl font-black mb-8 flex items-center gap-2 ${tipo === 'Ingreso' ? 'text-green-500' : 'text-red-500'}`}>
                            {editingId ? (tipo === 'Ingreso' ? 'Editar Ingreso' : 'Editar Gasto') : (tipo === 'Ingreso' ? 'Nuevo Ingreso' : 'Nuevo Gasto')}
                        </h2>

                        <form action={actionWithClose} className="space-y-6">
                            {/* Input oculto para el tipo si estamos editando, ya que el select/btns no lo envían directamente */}
                            {editingId && <input type="hidden" name="tipo" value={tipo} />}

                            <div>
                                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Monto del {tipo}</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">$</span>
                                    <input
                                        type="text"
                                        name="monto"
                                        inputMode="numeric"
                                        value={montoInput}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '')
                                            setMontoInput(val ? parseInt(val, 10).toLocaleString('es-CO') : '')
                                        }}
                                        required
                                        autoFocus={!editingId}
                                        className="w-full pl-10 p-5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl outline-none font-black text-2xl text-gray-900 dark:text-white transition-all shadow-inner"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {tipo === 'Gasto' && (
                                <div className="relative">
                                    <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Seleccionar Categoría</label>

                                    {/* Input oculto para que el FormData lo reciba correctamente */}
                                    <input type="hidden" name="categoriaId" value={categoriaId} />

                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                            className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none font-bold text-gray-800 dark:text-gray-200 transition-all flex justify-between items-center hover:bg-gray-100 dark:hover:bg-white/10 active:scale-[0.98]"
                                        >
                                            <span className="truncate">
                                                {categoriaId ? (categorias.find(c => c.id.toString() === categoriaId)?.nombre || 'Categoría') : 'Sin Categoría'}
                                            </span>
                                            <div className={`transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`}>
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </button>

                                        {showCategoryDropdown && (
                                            <>
                                                {/* Backdrop invisible para cerrar al hacer click fuera */}
                                                <div
                                                    className="fixed inset-0 z-[10]"
                                                    onClick={() => setShowCategoryDropdown(false)}
                                                ></div>

                                                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl z-[20] overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setCategoriaId('')
                                                            setShowCategoryDropdown(false)
                                                        }}
                                                        className={`w-full text-left p-4 text-sm font-bold transition-colors hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-50 dark:border-white/5 ${!categoriaId ? 'text-blue-500 bg-blue-50/30 dark:bg-blue-500/10' : 'text-gray-600 dark:text-gray-400'}`}
                                                    >
                                                        Sin Categoría
                                                    </button>
                                                    {categorias.map(cat => (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setCategoriaId(cat.id.toString())
                                                                setShowCategoryDropdown(false)
                                                            }}
                                                            className={`w-full text-left p-4 text-sm font-bold transition-colors hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-50 last:border-0 dark:border-white/5 ${categoriaId === cat.id.toString() ? 'text-blue-500 bg-blue-50/30 dark:bg-blue-500/10' : 'text-gray-600 dark:text-gray-400'}`}
                                                        >
                                                            {cat.nombre}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {categorias.length === 0 && (
                                        <p className="text-[10px] text-orange-500 font-bold mt-2 ml-1 uppercase tracking-tighter">No tienes categorías. Créalas en el menú de usuario.</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Nota / Descripción</label>
                                <textarea
                                    name="descripcion"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none text-gray-800 dark:text-gray-200 transition-all resize-none shadow-inner font-medium"
                                    placeholder="Escribe algo opcional..."
                                    rows={2}
                                ></textarea>
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <button
                                    type="submit"
                                    className={`w-full font-black py-5 rounded-2xl text-white shadow-xl transition-all active:scale-95 uppercase tracking-widest text-sm ${tipo === 'Ingreso' ? 'bg-green-500 hover:bg-green-600 shadow-green-900/20' : 'bg-red-500 hover:bg-red-600 shadow-red-900/20'}`}
                                >
                                    {editingId ? 'Guardar Cambios' : `Confirmar ${tipo}`}
                                </button>

                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="w-full font-black py-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all uppercase tracking-widest text-[10px]"
                                    >
                                        Eliminar Movimiento
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="¿Eliminar movimiento?"
                message="Esta acción no se puede deshacer y el monto será recalculado en tu balance."
                confirmText="Sí, eliminar"
                cancelText="No, mantener"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </>
    )
}
