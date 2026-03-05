import { prisma } from "@/lib/prisma"
import DateFilter from "@/components/DateFilter"
import CategoryBreakdown from "@/components/CategoryBreakdown"
import StickyBalanceHeader from "@/components/StickyBalanceHeader"
import TransactionsManager from "@/components/TransactionsManager"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"

import UserMenu from "@/components/UserMenu"

export const dynamic = "force-dynamic"

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = parseInt(session.user.id)

  const params = await searchParams
  const period = (params?.period as string) || 'mes'
  const startParam = params?.start as string
  const endParam = params?.end as string

  let startDate = new Date(0)
  let endDate = new Date('2100-01-01')
  const now = new Date()

  if (period === 'hoy') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  } else if (period === 'semana') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    startDate = new Date(now.getFullYear(), now.getMonth(), diff)
    startDate.setHours(0, 0, 0, 0)
    endDate = new Date(now.getFullYear(), now.getMonth(), diff + 6, 23, 59, 59, 999)
  } else if (period === 'mes') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  } else if (period === 'custom' && startParam && endParam) {
    startDate = new Date(`${startParam}T00:00:00`)
    endDate = new Date(`${endParam}T23:59:59`)
  }

  // Fetch Categorías del Usuario
  const userCategorias = await prisma.categoria.findMany({
    where: { userId: userId },
    orderBy: { nombre: 'asc' }
  })

  // Filtrado a Nivel Base de Datos con Prisma + Usuario + Categoría
  const txs = await prisma.transacciones.findMany({
    where: {
      userId: userId,
      fecha: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      categoria: true
    },
    orderBy: { fecha: 'desc' }
  })

  let total_ingresos = 0
  let total_gastos = 0
  const categoriesBreakdown: Record<string, { ingreso: number, gasto: number }> = {}

  txs.forEach((tx: any) => {
    const amount = Number(tx.monto)
    if (tx.tipo === 'Ingreso') total_ingresos += amount
    else total_gastos += amount

    const catName = tx.categoria?.nombre || 'Sin Categoría'

    if (!categoriesBreakdown[catName]) categoriesBreakdown[catName] = { ingreso: 0, gasto: 0 }
    if (tx.tipo === 'Ingreso') categoriesBreakdown[catName].ingreso += amount
    else categoriesBreakdown[catName].gasto += amount
  })

  const utilidad_neta = total_ingresos - total_gastos
  const utilidadColor = utilidad_neta >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 dark:bg-black font-sans">
      <StickyBalanceHeader
        utilidad_neta={utilidad_neta}
        total_ingresos={total_ingresos}
        total_gastos={total_gastos}
        utilidadColor={utilidadColor}
      />
      <main className="w-full max-w-md bg-white dark:bg-zinc-950 min-h-screen shadow-2xl relative flex flex-col pb-32 sm:pb-20 overflow-hidden">

        {/* Header con Logout Desplegable */}
        <div className="bg-gradient-to-b from-blue-700 to-blue-900 dark:from-blue-900 dark:to-blue-950 text-white pt-10 pb-10 px-6 rounded-b-[40px] shadow-lg relative flex-shrink-0 transition-all duration-300 z-[50]">
          <div className="absolute inset-0 overflow-hidden rounded-b-[40px] pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="flex justify-between items-center mb-8 relative z-20 transition-all">
            <div className="text-3xl font-black text-white tracking-tighter">
              Bilu
            </div>

            <UserMenu user={session.user} />
          </div>

          <h1 className="text-white/80 text-sm font-medium uppercase tracking-wider mb-2 relative z-10 flex items-center justify-between">
            <span>Utilidad Neta</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white capitalize">{period === 'custom' ? 'Personalizado' : (period === 'hoy' ? 'Hoy' : period === 'semana' ? 'Esta semana' : period === 'mes' ? 'Este mes' : 'Todo el tiempo')}</span>
          </h1>
          <div className={`text-5xl font-black flex items-center gap-1 relative z-10 tracking-tight ${utilidadColor}`}>
            <span className="text-3xl font-bold opacity-80">{utilidad_neta < 0 ? '-' : ''}$</span>
            <span>{Math.abs(utilidad_neta).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between mt-8 gap-4 relative z-10">
            <div className="bg-white/10 rounded-2xl p-4 flex-1 backdrop-blur-md border border-white/10 shadow-inner">
              <span className="text-xs text-white/70 font-bold block mb-1 uppercase tracking-wider">Ingresos</span>
              <span className="font-semibold text-xl text-green-300">${total_ingresos.toLocaleString('es-CO')}</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 flex-1 backdrop-blur-md border border-white/10 shadow-inner">
              <span className="text-xs text-white/70 font-bold block mb-1 uppercase tracking-wider">Gastos</span>
              <span className="font-semibold text-xl text-red-300">${total_gastos.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        <div className="px-6 mt-6 flex flex-col flex-1 overflow-y-auto">
          {/* Filtro de Fechas */}
          <DateFilter />

          {/* Breakdown Categorias */}
          <CategoryBreakdown categoriesBreakdown={categoriesBreakdown} total_gastos={total_gastos} />

          {/* Gestión de Transacciones (Lista + Modales) */}
          <TransactionsManager txs={txs} categorias={userCategorias} />
        </div>
      </main>
    </div>
  )
}
