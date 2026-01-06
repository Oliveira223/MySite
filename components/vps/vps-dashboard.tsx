'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Server, HardDrive, Cpu, MemoryStick, Database } from "lucide-react"
import { getVPSStats, type VPSStats } from "@/app/actions/vps"
import { Progress } from "@/components/ui/progress"

interface VpsDashboardProps {
  initialStats: VPSStats
}

export function VpsDashboard({ initialStats }: VpsDashboardProps) {
  const [stats, setStats] = useState<VPSStats>(initialStats)
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const newStats = await getVPSStats()
      setStats(newStats)
    } catch (error) {
      console.error("Failed to refresh stats", error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24))
    const hours = Math.floor((seconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Monitoramento VPS</h2>
          <p className="text-muted-foreground">Visão geral do servidor e recursos.</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema Operacional</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={stats.os.distro}>{stats.os.distro}</div>
            <p className="text-xs text-muted-foreground">
              {stats.os.platform} ({stats.os.arch})
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Hostname: {stats.os.hostname}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Atividade</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">⏱️</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(stats.uptime)}</div>
            <p className="text-xs text-muted-foreground">
              Online desde o último reboot
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Load</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cpu.load.toFixed(1)}%</div>
            <Progress value={stats.cpu.load} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.cpu.cores} Cores ({stats.cpu.speed} GHz)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memória RAM</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats.mem.active / stats.mem.total) * 100).toFixed(1)}%
            </div>
            <Progress value={(stats.mem.active / stats.mem.total) * 100} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {formatBytes(stats.mem.active)} / {formatBytes(stats.mem.total)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Discos e Armazenamento</CardTitle>
            <CardDescription>Uso do sistema de arquivos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.disk.map((disk, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    <span className="font-medium">{disk.mount}</span>
                    <span className="text-muted-foreground text-xs">({disk.fs})</span>
                  </div>
                  <span>{disk.use.toFixed(1)}%</span>
                </div>
                <Progress value={disk.use} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Usado: {formatBytes(disk.used)}</span>
                  <span>Total: {formatBytes(disk.size)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Detalhes da CPU</CardTitle>
                <CardDescription>Informações do processador</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Fabricante</span>
                        <span className="font-medium">{stats.cpu.manufacturer}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Marca</span>
                        <span className="font-medium">{stats.cpu.brand}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Núcleos Físicos</span>
                        <span className="font-medium">{stats.cpu.physicalCores}</span>
                    </div>
                     <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Velocidade</span>
                        <span className="font-medium">{stats.cpu.speed} GHz</span>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
