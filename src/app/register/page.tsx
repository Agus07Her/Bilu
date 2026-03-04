'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser } from '../actions'
import Link from 'next/link'

export default function RegisterPage() {
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData()
        formData.append('nombre', nombre)
        formData.append('email', email)
        formData.append('password', password)

        const result = await registerUser(formData)
        setLoading(false)

        if (result?.error) {
            setError(result.error)
        } else if (result?.success) {
            router.push('/')
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl">
                <h1 className="text-3xl font-bold text-white mb-2 text-center">Registrar Usuario</h1>
                <p className="text-blue-200/60 mb-8 text-center text-sm">Comienza a gestionar tus finanzas hoy</p>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-white/80 block text-xs font-medium uppercase tracking-wider mb-2 ml-1">Nombre Completo</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
                            placeholder="Ej. Juan Pérez"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </div>
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
                        <label className="text-white/80 block text-xs font-medium uppercase tracking-wider mb-2 ml-1">Contraseña</label>
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
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold p-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/40 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {loading ? 'Creando cuenta...' : 'Registrarse'}
                    </button>
                </form>

                <p className="mt-8 text-center text-white/40 text-sm">
                    ¿Ya tienes una cuenta? <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium ml-1 underline underline-offset-4 transition-all">Inicia Sesión</Link>
                </p>
            </div>
        </div>
    )
}
