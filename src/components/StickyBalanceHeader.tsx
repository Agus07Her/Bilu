'use client'

import { useState, useEffect } from 'react'

interface StickyBalanceHeaderProps {
    utilidad_neta: number
    total_ingresos: number
    total_gastos: number
    utilidadColor: string
}

export default function StickyBalanceHeader({
    utilidad_neta,
    total_ingresos,
    total_gastos,
    utilidadColor
}: StickyBalanceHeaderProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            // Mostrar cuando el scroll supera los 200px (aproximadamente cuando el header principal desaparece)
            setIsVisible(window.scrollY > 250)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[120] transition-all duration-500 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                }`}
        >
            <div className="max-w-md mx-auto bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-900 dark:to-blue-950 px-6 py-5 flex items-center justify-between shadow-2xl border-b border-white/10 rounded-b-3xl">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.1em] mb-0.5">Utilidad Neta</span>
                    <div className={`text-2xl font-black leading-none tracking-tight ${utilidadColor}`}>
                        <span className="text-sm opacity-80 mr-0.5">$</span>
                        {Math.abs(utilidad_neta).toLocaleString('es-CO')}
                    </div>
                </div>

                <div className="flex gap-5">
                    <div className="flex flex-col items-center bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                        <span className="text-[9px] font-black text-white/50 uppercase tracking-wider mb-0.5">Ingresos</span>
                        <span className="text-sm font-bold text-green-300 leading-none">
                            ${total_ingresos.toLocaleString('es-CO')}
                        </span>
                    </div>
                    <div className="flex flex-col items-center bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                        <span className="text-[9px] font-black text-white/50 uppercase tracking-wider mb-0.5">Gastos</span>
                        <span className="text-sm font-bold text-red-300 leading-none">
                            ${total_gastos.toLocaleString('es-CO')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
