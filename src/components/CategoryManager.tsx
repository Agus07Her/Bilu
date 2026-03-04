'use client'

import { useState, useEffect } from 'react'
import { addCategoria, deleteCategoria, getCategorias } from '@/app/actions'
import ConfirmDialog from './ConfirmDialog'

import { Categoria } from '@/types'

interface CategoryManagerProps {
    isOpen: boolean
    onClose: () => void
}

export default function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
    const [nombre, setNombre] = useState('')
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

    useEffect(() => {
        if (isOpen) {
            loadCategorias()
        }
    }, [isOpen])

    async function loadCategorias() {
        const data = await getCategorias()
        setCategorias(data)
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await addCategoria(nombre)
        setLoading(false)

        if (result?.error) {
            setError(result.error)
        } else {
            setNombre('')
            loadCategorias()
        }
    }

    async function confirmDelete() {
        if (showDeleteConfirm === null) return
        const result = await deleteCategoria(showDeleteConfirm)
        setShowDeleteConfirm(null)
        if (result?.error) {
            alert(result.error)
        } else {
            loadCategorias()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[80vh]">

                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        Categorías
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <form onSubmit={handleAdd} className="mb-8">
                        <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block ml-1">Nueva Categoría</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                required
                                className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 rounded-2xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:font-medium"
                                placeholder="Ej. Comida, Salud..."
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-2xl transition-all disabled:opacity-50"
                            >
                                {loading ? '...' : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>}
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-[10px] mt-2 font-bold ml-1 uppercase">{error}</p>}
                    </form>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 block ml-1">Categorías Actuales</label>
                        {categorias.length === 0 ? (
                            <p className="text-center py-8 text-gray-400 text-sm font-medium">No has creado categorías aún.</p>
                        ) : (
                            categorias.map(cat => (
                                <div key={cat.id} className="flex justify-between items-center p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 group hover:border-blue-200 dark:hover:border-blue-500/50 transition-all">
                                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{cat.nombre}</span>
                                    <button
                                        onClick={() => setShowDeleteConfirm(cat.id)}
                                        className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                    <button onClick={onClose} className="w-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white font-black p-4 rounded-2xl hover:bg-gray-300 dark:hover:bg-white/20 transition-all text-sm uppercase tracking-widest">
                        Cerrar
                    </button>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm !== null}
                title="¿Eliminar categoría?"
                message="Esta acción no se puede deshacer. Solo podrás eliminarla si no tiene movimientos asociados."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(null)}
            />
        </div>
    )
}
