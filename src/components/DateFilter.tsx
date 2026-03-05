'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

function DateFilterContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentPeriod = searchParams.get('period') || 'mes'
    const currentStart = searchParams.get('start') || ''
    const currentEnd = searchParams.get('end') || ''

    const [period, setPeriod] = useState(currentPeriod)
    const [customStart, setCustomStart] = useState(currentStart)
    const [customEnd, setCustomEnd] = useState(currentEnd)
    const [showDropdown, setShowDropdown] = useState(false)

    const handleSelect = (p: string) => {
        setPeriod(p)
        setShowDropdown(false)
        if (p !== 'custom') {
            router.push(`/?period=${p}`)
        }
    }

    const applyCustom = () => {
        if (customStart && customEnd) {
            router.push(`/?period=custom&start=${customStart}&end=${customEnd}`)
        }
    }

    const periods = [
        { value: 'hoy', label: 'Hoy' },
        { value: 'semana', label: 'Esta Semana' },
        { value: 'mes', label: 'Este Mes' },
        { value: 'todo', label: 'Todo el tiempo' },
        { value: 'custom', label: 'Personalizado' },
    ]

    return (
        <div className="flex flex-col gap-2 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-zinc-800 mb-8 mt-2 relative z-30">
            <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-300">Filtrar por periodo</span>

                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="bg-gray-100 dark:bg-zinc-800 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        {periods.find(p => p.value === period)?.label}
                        <svg
                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowDropdown(false)}
                            ></div>
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {periods.map((p) => (
                                    <button
                                        key={p.value}
                                        onClick={() => handleSelect(p.value)}
                                        className={`w-full text-left px-4 py-3 text-sm font-bold transition-all hover:bg-gray-50 dark:hover:bg-zinc-800 border-b border-gray-50 dark:border-zinc-800 last:border-0 ${period === p.value ? 'text-blue-500 bg-blue-50/30' : 'text-gray-600 dark:text-gray-400'}`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {period === 'custom' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2">
                    <input
                        type="date"
                        value={customStart}
                        onChange={e => setCustomStart(e.target.value)}
                        className="flex-1 bg-gray-50 dark:bg-zinc-800 rounded-xl p-2 text-xs font-semibold outline-none border border-transparent focus:border-blue-500 text-gray-900 dark:text-white"
                    />
                    <input
                        type="date"
                        value={customEnd}
                        onChange={e => setCustomEnd(e.target.value)}
                        className="flex-1 bg-gray-50 dark:bg-zinc-800 rounded-xl p-2 text-xs font-semibold outline-none border border-transparent focus:border-blue-500 text-gray-900 dark:text-white"
                    />
                    <button
                        onClick={applyCustom}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-2 text-sm font-bold px-4 transition-colors"
                    >
                        Ver
                    </button>
                </div>
            )}
        </div>
    )
}

export default function DateFilter() {
    return (
        <Suspense fallback={<div className="h-16 bg-gray-100 dark:bg-zinc-900 rounded-2xl w-full animate-pulse mb-8 mt-2"></div>}>
            <DateFilterContent />
        </Suspense>
    )
}
