'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                if (result.error.includes("EMAIL_NOT_VERIFIED")) {
                    router.push(`/verify-email?email=${encodeURIComponent(email)}`)
                } else {
                    setError('Email o contraseña incorrectos')
                }
            } else {
                router.push('/')
                router.refresh()
            }
        } catch (err) {
            setError('Hubo un problema al iniciar sesión. Inténtalo de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const verified = searchParams?.get('verified')
    const reset = searchParams?.get('reset')

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl">
                <h1 className="text-3xl font-bold text-white mb-2 text-center uppercase tracking-widest">INGRESAR</h1>
                <p className="text-blue-200/60 mb-8 text-center text-sm">Gestiona tus ingresos y gastos de forma privada</p>

                {verified && (
                    <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 p-3 rounded-lg mb-6 text-sm text-center font-bold">
                        ¡Cuenta verificada! Ya puedes iniciar sesión.
                    </div>
                )}

                {reset && (
                    <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 p-3 rounded-lg mb-6 text-sm text-center font-bold">
                        Contraseña actualizada. Inicia sesión con tus nuevas credenciales.
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-white/80 block text-xs font-medium uppercase tracking-wider mb-2 ml-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="text-white/80 block text-xs font-medium uppercase tracking-wider">Contraseña</label>
                            <Link href="/forgot-password" className="text-[10px] text-blue-400 hover:text-blue-300 uppercase font-black tracking-tighter">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <input
                            type="password"
                            required
                            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold p-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/40 active:scale-95 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Accediendo...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="mt-8 text-center text-white/40 text-sm">
                    ¿Aún no tienes cuenta? <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium ml-1 underline underline-offset-4 transition-all">Regístrate gratis</Link>
                </p>
            </div>
        </div>
    )
}
