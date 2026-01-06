import { getWorkoutHistory } from '../actions'
import { ExercisesClient } from './exercises-client'

export default async function ExercisesPage() {
  const history = await getWorkoutHistory()

  return (
    <div className="px-2 py-4 md:p-8 max-w-2xl mx-auto w-full overflow-x-hidden">
      <h1 className="text-2xl font-bold mb-6 px-1">Meus Treinos</h1>
      <ExercisesClient history={history as any} />
    </div>
  )
}
