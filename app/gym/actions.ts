'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// --- BUSCAR DADOS ---

export async function getTodaysWorkout() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const session = await prisma.workoutSession.findFirst({
    where: {
      date: {
        gte: today,
        lt: tomorrow
      }
    },
    include: {
      exercises: {
        include: {
          sets: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  })

  return session
}

export async function getWorkoutHistory() {
  const sessions = await prisma.workoutSession.findMany({
    orderBy: { date: 'desc' },
    include: {
      exercises: {
        include: {
          sets: true
        }
      }
    }
  })
  return sessions
}

// --- AÇÕES ---

export async function createWorkoutSession(name: string) {
  await prisma.workoutSession.create({
    data: {
      name: name || `Treino ${new Date().toLocaleDateString('pt-BR')}`
    }
  })
  revalidatePath('/gym')
}

export async function addExerciseToWorkout(sessionId: string, exerciseName: string, muscleGroup: string) {
  const exercise = await prisma.workoutExercise.create({
    data: {
      workoutSessionId: sessionId,
      name: exerciseName,
      muscleGroup
    }
  })
  revalidatePath('/gym')
  return exercise.id
}

export async function addSetToExercise(exerciseId: string, weight: number, reps: number) {
  // Descobre a ordem (última ordem + 1)
  const lastSet = await prisma.exerciseSet.findFirst({
    where: { workoutExerciseId: exerciseId },
    orderBy: { order: 'desc' }
  })
  
  const newOrder = lastSet ? lastSet.order + 1 : 1

  await prisma.exerciseSet.create({
    data: {
      workoutExerciseId: exerciseId,
      weight,
      reps,
      order: newOrder
    }
  })
  revalidatePath('/gym')
}

export async function deleteSet(setId: string) {
  await prisma.exerciseSet.delete({ where: { id: setId } })
  revalidatePath('/gym')
}

export async function deleteWorkoutSession(sessionId: string) {
  await prisma.workoutSession.delete({
    where: { id: sessionId }
  })
  revalidatePath('/gym')
  revalidatePath('/gym/exercises')
}

export async function deleteWorkoutExercise(exerciseId: string) {
  await prisma.workoutExercise.delete({
    where: { id: exerciseId }
  })
  revalidatePath('/gym')
  revalidatePath('/gym/exercises')
}

export async function duplicateWorkoutSession(sessionId: string) {
  // 1. Buscar o treino original
  const originalSession = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      exercises: {
        include: {
          sets: true
        }
      }
    }
  })

  if (!originalSession) return

  // 2. Criar novo treino com data de hoje
  const newSession = await prisma.workoutSession.create({
    data: {
      name: originalSession.name, // Mantém o nome original (ex: "Treino de Peito")
      date: new Date(), // Define data como agora
    }
  })

  // 3. Copiar exercícios e séries
  for (const exercise of originalSession.exercises) {
    await prisma.workoutExercise.create({
      data: {
        workoutSessionId: newSession.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        sets: {
          create: exercise.sets.map(set => ({
            weight: set.weight,
            reps: set.reps,
            order: set.order
          }))
        }
      }
    })
  }

  revalidatePath('/gym')
}

export async function getDashboardStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfToday = new Date(now.setHours(0,0,0,0))
  const endOfToday = new Date(now.setHours(23,59,59,999))

  // Workouts this month
  const workoutsThisMonth = await prisma.workoutSession.count({
    where: {
      date: {
        gte: startOfMonth
      }
    }
  })

  // Last month for comparison (simple approximation)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const workoutsLastMonth = await prisma.workoutSession.count({
    where: {
      date: {
        gte: startOfLastMonth,
        lte: endOfLastMonth
      }
    }
  })

  // Total Load Today (Volume)
  const todaySession = await prisma.workoutSession.findFirst({
    where: {
      date: {
        gte: startOfToday,
        lte: endOfToday
      }
    },
    include: {
      exercises: {
        include: {
          sets: true
        }
      }
    }
  })

  let totalLoadToday = 0
  if (todaySession) {
    todaySession.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        totalLoadToday += set.weight * set.reps
      })
    })
  }

  // Streak (Sequência)
  const recentSessions = await prisma.workoutSession.findMany({
    select: { date: true },
    orderBy: { date: 'desc' },
    take: 30
  })

  let streak = 0
  if (recentSessions.length > 0) {
      // Check if worked out today or yesterday to keep streak alive
      const todayStr = startOfToday.toDateString()
      const yesterday = new Date(startOfToday)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toDateString()

      const lastWorkoutDate = new Date(recentSessions[0].date).toDateString()
      
      if (lastWorkoutDate === todayStr || lastWorkoutDate === yesterdayStr) {
          streak = 1
          let checkDate = new Date(recentSessions[0].date)
          checkDate.setHours(0,0,0,0)

          for (let i = 1; i < recentSessions.length; i++) {
              const prevDate = new Date(recentSessions[i].date)
              prevDate.setHours(0,0,0,0)
              
              const diffTime = Math.abs(checkDate.getTime() - prevDate.getTime())
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 

              if (diffDays === 1) {
                  streak++
                  checkDate = prevDate
              } else if (diffDays === 0) {
                  continue
              } else {
                  break
              }
          }
      }
  }

  return {
    workoutsThisMonth,
    workoutsLastMonth,
    totalLoadToday,
    streak
  }
}

export async function getWeeklyVolumeData() {
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 6)
  sevenDaysAgo.setHours(0,0,0,0)

  const sessions = await prisma.workoutSession.findMany({
    where: {
      date: {
        gte: sevenDaysAgo
      }
    },
    include: {
      exercises: {
        include: {
          sets: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  })

  // Agrupar por dia
  const daysMap = new Map<string, number>()
  
  // Inicializar últimos 7 dias com 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i)
    const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
    // Usar data completa como chave para garantir unicidade, mas nome curto para display
    daysMap.set(dayName, 0)
  }

  // Preencher com dados reais (Volume = Sets * Reps * Weight)
  sessions.forEach(session => {
    const dayName = new Date(session.date).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
    let sessionVolume = 0
    session.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        sessionVolume += set.weight * set.reps
      })
    })
    
    // Se tiver mais de um treino no dia, soma
    const current = daysMap.get(dayName) || 0
    daysMap.set(dayName, current + sessionVolume)
  })

  // Converter para array para o Recharts
  // O Map preserva a ordem de inserção (então vai de 7 dias atrás até hoje)
  return Array.from(daysMap.entries()).map(([name, volume]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    volume
  }))
}

export async function getMuscleDistribution() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)

  const exercises = await prisma.workoutExercise.groupBy({
    by: ['muscleGroup'],
    where: {
      workoutSession: {
        date: {
          gte: thirtyDaysAgo
        }
      }
    },
    _count: {
      id: true
    }
  })

  // Formatar para gráfico
  return exercises
    .filter(e => e.muscleGroup) // Remover nulos
    .map(e => ({
      name: e.muscleGroup as string,
      value: e._count.id
    }))
    .sort((a, b) => b.value - a.value) // Mais frequentes primeiro
}
