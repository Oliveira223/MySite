import { getDashboardStats, getWeeklyVolumeData, getMuscleDistribution } from './actions'
import { VolumeChart, MuscleDistributionChart } from './charts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function GymDashboard() {
  const stats = await getDashboardStats()
  const weeklyVolume = await getWeeklyVolumeData()
  const muscleDistribution = await getMuscleDistribution()

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard da Academia</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card Estatística 1 */}
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Treinos este mês</h3>
          <div className="text-2xl font-bold mt-2">{stats.workoutsThisMonth}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.workoutsThisMonth > stats.workoutsLastMonth 
                ? `+${stats.workoutsThisMonth - stats.workoutsLastMonth} que mês passado` 
                : `${stats.workoutsThisMonth - stats.workoutsLastMonth} que mês passado`}
          </p>
        </div>
        
        {/* Card Estatística 2 */}
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Carga Total (Hoje)</h3>
          <div className="text-2xl font-bold mt-2">{stats.totalLoadToday.toLocaleString('pt-BR')} kg</div>
        </div>

        {/* Card Estatística 3 */}
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Sequência</h3>
          <div className="text-2xl font-bold mt-2">🔥 {stats.streak} dias</div>
        </div>
      </div>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Volume de Treino (Últimos 7 dias)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <VolumeChart data={weeklyVolume} />
            </CardContent>
        </Card>

        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Foco Muscular (30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
                <MuscleDistributionChart data={muscleDistribution} />
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
