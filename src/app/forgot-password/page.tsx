'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { requestPasswordReset } from '../actions'

export default function ForgotPasswordPage() {
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [message, setMessage] = useState({ type: '', text: '' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        const res = await requestPasswordReset(email)

        if (res.error) {
            setMessage({ type: 'error', text: res.error })
            setLoading(false)
        } else {
            setMessage({ type: 'success', text: 'Si el correo existe, recibirás un código de restablecimiento en unos minutos.' })
            setTimeout(() => {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`)
            }, 3000)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[40px] p-10 shadow-2xl border border-gray-100 dark:border-white/5">
                <div className="mb-8 text-center text-left">
                    <button onClick={() => router.back()} className="mb-4 text-blue-600 font-bold flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                        Volver al login
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Recuperar contraseña</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Te enviaremos un código para que puedas elegir una nueva contraseña de forma segura.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="email"
                            placeholder="Tu correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-900 dark:text-white transition-all shadow-inner"
                            required
                        />
                    </div>

                    {message.text && (
                        <p className={`p-4 rounded-xl text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-green-50 dark:bg-green-500/10 text-green-500'}`}>
                            {message.text}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
                    >
                        {loading ? 'Enviando...' : 'Enviar Código'}
                    </button>
                </form>
            </div>
        </div>
    )
}
