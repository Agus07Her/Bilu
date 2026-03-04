'use client'

import { useState } from 'react'

interface CategoryBreakdownProps {
    categoriesBreakdown: Record<string, { ingreso: number; gasto: number }>
    total_gastos: number
}

export default function CategoryBreakdown({ categoriesBreakdown, total_gastos }: CategoryBreakdownProps) {
    const [isOpen, setIsOpen] = useState(false)

    const hasExpenses = Object.values(categoriesBreakdown).some(cat => cat.gasto > 0)

    if (!hasExpenses && total_gastos === 0) return null

    return (
        <div className="mb-10 bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-3xl border border-gray-100 dark:border-zinc-800 transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center outline-none group"
            >
                <div className="w-4" /> {/* Spacer for centering */}
                <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center flex-1">
                    Desglose por Categoría
                </h3>
                <div className={`p-1 rounded-lg transition-colors ${isOpen ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' : 'text-gray-400'}`}>
                    <svg
                        className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] mt-6 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="space-y-5">
                    {Object.entries(categoriesBreakdown)
                        .sort((a, b) => b[1].gasto - a[1].gasto)
                        .map(([cat, { gasto }]) => {
                            if (gasto <= 0) return null
                            const gastoP = total_gastos > 0 ? (gasto / total_gastos) * 100 : 0
                            return (
                                <div key={cat} className="group">
                                    <div className="flex justify-between text-sm mb-2 font-bold text-gray-700 dark:text-gray-300">
                                        <span className="capitalize">{cat}</span>
                                        <span className="text-red-500 font-black">
                                            -${gasto.toLocaleString('es-CO')}
                                            <span className="text-[10px] opacity-40 ml-1.5 font-bold">
                                                {Math.round(gastoP)}%
                                            </span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden shadow-inner">
                                        <div
                                            className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-1000"
                                            style={{ width: isOpen ? `${gastoP}%` : '0%' }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })}
                    {total_gastos === 0 && (
                        <p className="text-xs font-bold text-center text-gray-400 py-2 uppercase tracking-tight">
                            No hay gastos en este periodo.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
