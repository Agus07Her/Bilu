'use client'

import { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'

import CategoryManager from "@/components/CategoryManager"

interface UserMenuProps {
    user: {
        name?: string | null
        email?: string | null
    }
}

export default function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isManagerOpen, setIsManagerOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.[0].toUpperCase() || 'U'

    return (
        <div className="relative z-10" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 group outline-none"
            >
                <div className="w-9 h-9 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-white text-xs font-black shadow-lg transition-all group-hover:bg-white/30 group-active:scale-90 overflow-hidden backdrop-blur-md">
                    {initials}
                </div>
                <div className="flex flex-col items-start text-left">
                    <span className="text-white/60 text-[9px] font-black uppercase tracking-widest leading-none mb-0.5">Perfil</span>
                    <svg
                        className={`w-3 h-3 text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Usuario Activo</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name || 'Sin Nombre'}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="p-2 space-y-1">
                        <button
                            onClick={() => {
                                setIsManagerOpen(true)
                                setIsOpen(false)
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center transition-colors group-hover:bg-blue-200 dark:group-hover:bg-blue-500/30">
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            Categorías
                        </button>

                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center transition-colors group-hover:bg-red-200 dark:group-hover:bg-red-500/30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}

            <CategoryManager
                isOpen={isManagerOpen}
                onClose={() => setIsManagerOpen(false)}
            />
        </div>
    )
}
