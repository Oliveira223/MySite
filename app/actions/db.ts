'use server'

import { prisma } from '@/lib/db'

export interface TableStat {
  tableName: string
  count: number
}

export async function getDBStats(): Promise<TableStat[]> {
  const [
    workoutSessionCount,
    workoutExerciseCount,
    exerciseSetCount,
    studySubjectCount,
    studySessionCount,
    studyTaskCount,
    studyGradeCount
  ] = await Promise.all([
    prisma.workoutSession.count(),
    prisma.workoutExercise.count(),
    prisma.exerciseSet.count(),
    prisma.studySubject.count(),
    prisma.studySession.count(),
    prisma.studyTask.count(),
    prisma.studyGrade.count()
  ])

  return [
    { tableName: 'WorkoutSession', count: workoutSessionCount },
    { tableName: 'WorkoutExercise', count: workoutExerciseCount },
    { tableName: 'ExerciseSet', count: exerciseSetCount },
    { tableName: 'StudySubject', count: studySubjectCount },
    { tableName: 'StudySession', count: studySessionCount },
    { tableName: 'StudyTask', count: studyTaskCount },
    { tableName: 'StudyGrade', count: studyGradeCount }
  ]
}
