'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSyncManager, syncTransactions } from '@/lib/syncService'

export default function OfflineMonitor() {
    const router = useRouter()

    useSyncManager(() => router.refresh()) // Activa el escuchador de red con refresco

    useEffect(() => {
        // Al montar, intentamos enviar lo pendiente si hay red
        syncTransactions(() => router.refresh())
    }, [router])

    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        setIsOnline(navigator.onLine)

        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (isOnline) return null

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[300px]">
            <div className="bg-amber-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white animate-bounce-subtle mx-auto">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-black uppercase tracking-wider">Modo Offline</span>
            </div>
            <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    )
}
