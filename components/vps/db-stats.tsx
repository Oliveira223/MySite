'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, Table } from "lucide-react"
import { getDBStats, type TableStat } from "@/app/actions/db"

interface DbStatsProps {
  initialStats: TableStat[]
}

export function DbStats({ initialStats }: DbStatsProps) {
  const [stats, setStats] = useState<TableStat[]>(initialStats)
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const newStats = await getDBStats()
      setStats(newStats)
    } catch (error) {
      console.error("Failed to refresh db stats", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Banco de Dados
          </CardTitle>
          <CardDescription>Resumo dos registros nas tabelas do sistema</CardDescription>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="ghost" size="sm">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((table) => (
                <div key={table.tableName} className="flex items-center space-x-4 rounded-md border p-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Table className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{table.tableName}</p>
                        <p className="text-xs text-muted-foreground">Registros</p>
                    </div>
                    <div className="text-xl font-bold">{table.count}</div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
