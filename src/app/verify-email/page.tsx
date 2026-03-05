'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { verifyEmailCode } from '../actions'

export default function VerifyEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''

    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const res = await verifyEmailCode(email, code)

        if (res.error) {
            setError(res.error)
            setLoading(false)
        } else {
            router.push('/login?verified=true')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[40px] p-10 shadow-2xl border border-gray-100 dark:border-white/5">
                <div className="mb-8 text-center">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Verifica tu cuenta</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Hemos enviado un código a <span className="text-blue-600 font-bold">{email}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            placeholder="Código de 6 dígitos"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full p-5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 rounded-2xl outline-none font-black text-3xl text-center tracking-[10px] text-gray-900 dark:text-white transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-bold text-center bg-red-50 dark:bg-red-500/10 p-3 rounded-xl">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || code.length < 6}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
                    >
                        {loading ? 'Verificando...' : 'Confirmar Cuenta'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                    ¿No recibiste el código? <button className="text-blue-600 font-bold hover:underline">Reenviar</button>
                </p>
            </div>
        </div>
    )
}
