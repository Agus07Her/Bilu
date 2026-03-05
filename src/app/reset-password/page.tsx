'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { resetPassword } from '../actions'

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const emailParam = searchParams.get('email') || ''

    const [token, setToken] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const res = await resetPassword(emailParam, token, newPassword)

        if (res.error) {
            setError(res.error)
            setLoading(false)
        } else {
            router.push('/login?reset=true')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[40px] p-10 shadow-2xl border border-gray-100 dark:border-white/5">
                <div className="mb-8 text-center text-left">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Elegir nueva contraseña</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Ingresa el código que te enviamos y escribe tu nueva contraseña.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Código de verificación</label>
                        <input
                            type="text"
                            placeholder="6 dígitos"
                            maxLength={6}
                            value={token}
                            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                            className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 rounded-2xl outline-none font-black text-xl text-center tracking-[4px] text-gray-900 dark:text-white transition-all shadow-inner"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Nueva Contraseña</label>
                        <input
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-900 dark:text-white transition-all shadow-inner"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-bold text-center bg-red-50 dark:bg-red-500/10 p-3 rounded-xl">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || token.length < 6}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
                    >
                        {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">Cargando...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
