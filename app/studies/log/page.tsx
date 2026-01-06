import { getSubjects } from '../actions'
import { StudiesLog } from '@/components/studies/studies-log'

export default async function StudiesLogPage() {
  const subjects = await getSubjects()

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-2">Registrar Sessão</h1>
      <p className="text-muted-foreground mb-8">Registre o que você estudou hoje.</p>
      
      <StudiesLog subjects={subjects} />
    </div>
  )
}
