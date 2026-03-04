'use client'

interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    onCancel: () => void
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'info'
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger'
}: ConfirmDialogProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-950 w-full max-w-xs rounded-[32px] overflow-hidden shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">
                        {title}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                        {message}
                    </p>
                </div>
                <div className="flex flex-col p-6 gap-3 pt-0">
                    <button
                        onClick={onConfirm}
                        className={`w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg ${variant === 'danger'
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-900/20'
                                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-4 rounded-2xl text-gray-400 hover:text-gray-800 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    )
}
