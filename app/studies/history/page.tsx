import { getRecentSessions } from '../actions'
import { StudiesHistory } from '@/components/studies/studies-history'

export default async function StudiesHistoryPage() {
  const recentSessionsData = await getRecentSessions()
  const recentSessions = recentSessionsData.map(session => ({
      ...session,
      date: session.date.toISOString()
  }))

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-2">Histórico de Estudos</h1>
      <p className="text-muted-foreground mb-8">Veja todas as suas sessões de estudo recentes.</p>
      
      <StudiesHistory recentSessions={recentSessions} />
    </div>
  )
}
