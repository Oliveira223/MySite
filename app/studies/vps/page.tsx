import { Suspense } from 'react'
import { getVPSStats } from '@/app/actions/vps'
import { getDBStats } from '@/app/actions/db'
import { VpsDashboard } from '@/components/vps/vps-dashboard'
import { DbStats } from '@/components/vps/db-stats'
import { Separator } from "@/components/ui/separator"

export const dynamic = 'force-dynamic'

export default async function VpsPage() {
  const vpsStats = await getVPSStats()
  const dbStats = await getDBStats()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Painel VPS</h2>
      </div>
      <Separator />
      
      <div className="space-y-4">
        <Suspense fallback={<div>Carregando dados do servidor...</div>}>
          <VpsDashboard initialStats={vpsStats} />
        </Suspense>

        <Suspense fallback={<div>Carregando dados do banco...</div>}>
          <DbStats initialStats={dbStats} />
        </Suspense>
      </div>
    </div>
  )
}
