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

    const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const p = e.target.value
        setPeriod(p)
        if (p !== 'custom') {
            router.push(`/?period=${p}`)
        }
    }

    const applyCustom = () => {
        if (customStart && customEnd) {
            router.push(`/?period=custom&start=${customStart}&end=${customEnd}`)
        }
    }

    return (
        <div className="flex flex-col gap-2 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-zinc-800 mb-8 mt-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-300">Periodo</span>
                <select
                    value={period}
                    onChange={handlePeriodChange}
                    className="bg-gray-100 dark:bg-zinc-800 border-none rounded-xl p-2 outline-none text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                    <option value="hoy">Hoy</option>
                    <option value="semana">Esta Semana</option>
                    <option value="mes">Este Mes</option>
                    <option value="todo">Todo el tiempo</option>
                    <option value="custom">Personalizado</option>
                </select>
            </div>

            {period === 'custom' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2">
                    <input
                        type="date"
                        value={customStart}
                        onChange={e => setCustomStart(e.target.value)}
                        className="flex-1 bg-gray-50 dark:bg-zinc-800 rounded-xl p-2 text-xs font-semibold outline-none border border-transparent focus:border-blue-500"
                    />
                    <input
                        type="date"
                        value={customEnd}
                        onChange={e => setCustomEnd(e.target.value)}
                        className="flex-1 bg-gray-50 dark:bg-zinc-800 rounded-xl p-2 text-xs font-semibold outline-none border border-transparent focus:border-blue-500"
                    />
                    <button
                        onClick={applyCustom}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-2 text-sm font-bold px-4 transition-colors"
                    >
                        Ir
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
