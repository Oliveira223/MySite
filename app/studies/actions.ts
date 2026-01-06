'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// --- SUBJECTS ---

export async function getSubjects() {
  const subjects = await prisma.studySubject.findMany({
    include: {
      sessions: true,
      tasks: {
        where: { status: 'PENDING' }
      },
      grades: true
    }
  })
  
  // Calcular estatísticas básicas por matéria (Média Ponderada)
  return subjects.map(sub => {
    const totalWeight = sub.grades.reduce((acc, g) => acc + g.weight, 0)
    const weightedSum = sub.grades.reduce((acc, g) => acc + ((g.value / g.maxValue) * 10) * g.weight, 0)

    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    startOfWeek.setHours(0, 0, 0, 0)

    const minutesThisWeek = sub.sessions
        .filter(s => s.date >= startOfWeek)
        .reduce((acc, s) => acc + s.duration, 0)

    return {
      ...sub,
      totalMinutes: sub.sessions.reduce((acc, s) => acc + s.duration, 0),
      minutesThisWeek,
      averageGrade: totalWeight > 0 ? weightedSum / totalWeight : null
    }
  })
}

export async function createSubject(name: string, color: string) {
  await prisma.studySubject.create({
    data: { name, color }
  })
  revalidatePath('/studies')
}

export async function updateSubject(id: string, name: string, color: string) {
  await prisma.studySubject.update({
    where: { id },
    data: { name, color }
  })
  revalidatePath('/studies')
}

export async function deleteSubject(id: string) {
    await prisma.studySubject.delete({ where: { id } })
    revalidatePath('/studies')
}

// --- SESSIONS ---

export async function logStudySession(subjectId: string, duration: number, notes?: string, date?: Date) {
  await prisma.studySession.create({
    data: {
      subjectId,
      duration,
      notes,
      date: date || new Date()
    }
  })
  revalidatePath('/studies')
}

export async function getRecentSessions() {
    return await prisma.studySession.findMany({
        take: 50, // Increased limit for history page
        orderBy: { date: 'desc' },
        include: { subject: true }
    })
}

// --- TASKS ---

export async function createTask(title: string, subjectId: string | null, dueDate: Date | null, type: string = 'TASK') {
  const validSubjectId = (subjectId === 'none' || !subjectId) ? null : subjectId

  await prisma.studyTask.create({
    data: {
      title,
      subjectId: validSubjectId,
      dueDate,
      type,
      status: 'PENDING'
    }
  })
  revalidatePath('/studies')
}

export async function toggleTaskStatus(taskId: string, currentStatus: string) {
  await prisma.studyTask.update({
    where: { id: taskId },
    data: {
      status: currentStatus === 'PENDING' ? 'DONE' : 'PENDING'
    }
  })
  revalidatePath('/studies')
}

export async function getTasks() {
    return await prisma.studyTask.findMany({
        orderBy: [
            { status: 'asc' }, // Pendentes primeiro
            { dueDate: 'asc' } // Mais urgentes primeiro
        ],
        include: { subject: true }
    })
}

export async function deleteTask(taskId: string) {
    await prisma.studyTask.delete({ where: { id: taskId } })
    revalidatePath('/studies')
}

// --- GRADES ---

export async function addGrade(subjectId: string, name: string, value: number, maxValue: number, weight: number = 1.0) {
  await prisma.studyGrade.create({
    data: {
      subjectId,
      name,
      value,
      maxValue,
      weight,
      date: new Date()
    }
  })
  revalidatePath('/studies')
}

export async function deleteGrade(gradeId: string) {
    await prisma.studyGrade.delete({ where: { id: gradeId } })
    revalidatePath('/studies')
}

// --- STATS & HEATMAP ---

export async function getStudyStats() {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Domingo
    startOfWeek.setHours(0,0,0,0)

    const sessions = await prisma.studySession.findMany({
        orderBy: { date: 'desc' }
    })

    const totalMinutesAllTime = sessions.reduce((acc, s) => acc + s.duration, 0)
    
    const minutesThisWeek = sessions
        .filter(s => new Date(s.date) >= startOfWeek)
        .reduce((acc, s) => acc + s.duration, 0)

    // Heatmap Data (Last 365 days)
    const heatmapData: Record<string, number> = {}
    const oneYearAgo = new Date(now)
    oneYearAgo.setFullYear(now.getFullYear() - 1)

    sessions.forEach(session => {
        const dateStr = new Date(session.date).toISOString().split('T')[0]
        if (new Date(session.date) >= oneYearAgo) {
            heatmapData[dateStr] = (heatmapData[dateStr] || 0) + session.duration
        }
    })

    // Converter para array [{ date: '2024-01-01', count: 120 }]
    const heatmapArray = Object.entries(heatmapData).map(([date, count]) => ({
        date,
        count
    }))

    return {
        totalMinutes: totalMinutesAllTime,
        minutesThisWeek: minutesThisWeek,
        heatmapData: heatmapArray
    }
}
