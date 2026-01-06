import { getTodaysWorkout } from '../actions'
import { GymClient } from '../gym-client'

export default async function GymPage() {
  const session = await getTodaysWorkout()
  
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <GymClient initialSession={session as any} />
    </div>
  )
}
