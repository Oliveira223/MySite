import { getSubjects, getTasks } from '../actions'
import { StudiesSubjects } from '@/components/studies/studies-subjects'

export default async function StudiesSubjectsPage() {
  const subjects = await getSubjects()
  const tasks = await getTasks()

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-2">Matérias</h1>
      <p className="text-muted-foreground mb-8">Gerencie suas matérias e notas.</p>
      
      <StudiesSubjects subjects={subjects} tasks={tasks} />
    </div>
  )
}
