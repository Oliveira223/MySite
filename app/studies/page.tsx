import { getSubjects, getTasks, getStudyStats, getRecentSessions } from './actions'
import { StudiesDashboard } from '@/components/studies/studies-dashboard'

export default async function StudiesPage({ searchParams }: { searchParams: Promise<{ tab?: string, action?: string }> }) {
  const { tab, action } = await searchParams
  const subjects = await getSubjects()
  const tasks = await getTasks()
  const stats = await getStudyStats()
  const recentSessionsData = await getRecentSessions()
  
  // Serialize dates for client component
  const recentSessions = recentSessionsData.map(session => ({
      ...session,
      date: session.date.toISOString()
  }))

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto w-full">
      <StudiesDashboard  
        subjects={subjects} 
        tasks={tasks} 
        stats={stats}
        recentSessions={recentSessions}
        defaultTab={tab}
        defaultAction={action}
      />
    </div>
  )
}
