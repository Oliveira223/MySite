'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { CalendarDays, Dumbbell, History, Trophy, Trash2, Repeat } from "lucide-react"
import { deleteWorkoutExercise, duplicateWorkoutSession } from '../actions'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

type WorkoutSession = {
  id: string
  name: string | null
  date: Date
  exercises: {
    id: string
    name: string
    muscleGroup: string | null
    sets: { weight: number, reps: number }[]
  }[]
}

const muscleGroups = ["Todos", "Peito", "Costas", "Pernas", "Ombros", "Bíceps", "Tríceps", "Abdômen"]

export function ExercisesClient({ history }: { history: WorkoutSession[] }) {
  const [selectedMuscle, setSelectedMuscle] = useState("Peito")
  const router = useRouter()

  // Filtrar treinos que contenham exercícios do grupo muscular selecionado
  const filteredHistory = selectedMuscle === "Todos" 
    ? history 
    : history.filter(session => 
        session.exercises.some(ex => ex.muscleGroup === selectedMuscle)
      )

  const handleDeleteExercise = async (exerciseId: string) => {
    if (confirm('Tem certeza que deseja excluir este exercício do histórico?')) {
        await deleteWorkoutExercise(exerciseId)
    }
  }

  const handleRepeatWorkout = async (sessionId: string) => {
    if (confirm('Deseja iniciar um novo treino copiando os exercícios deste dia?')) {
        await duplicateWorkoutSession(sessionId)
        router.push('/gym') // Redireciona para o log diário
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-20 w-full max-w-full overflow-x-hidden">
      
      {/* Filtro de Grupos Musculares */}
      <div className="w-full max-w-full">
        <h2 className="text-lg font-bold mb-3 px-1">Selecione o Grupo</h2>
        <div className="flex flex-wrap gap-2 px-1">
            {muscleGroups.map((muscle) => (
              <Badge
                key={muscle}
                variant={selectedMuscle === muscle ? "default" : "outline"}
                className="cursor-pointer text-sm py-1.5 px-4 hover:bg-primary/90 hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedMuscle(muscle)}
              >
                {muscle}
              </Badge>
            ))}
        </div>
      </div>

      {/* Lista de Treinos */}
      <div className="flex flex-col gap-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
            <p>Nenhum treino de {selectedMuscle} encontrado.</p>
          </div>
        ) : (
          filteredHistory.map((session) => {
            // Filtrar apenas os exercícios do grupo selecionado dentro desta sessão
            const relevantExercises = session.exercises.filter(
                ex => selectedMuscle === "Todos" || ex.muscleGroup === selectedMuscle
            )
            
            if (relevantExercises.length === 0) return null

            return (
                <div key={session.id} className="flex flex-col gap-2">
                    {/* Data como cabeçalho de seção (estilo bloco de notas/log) */}
                    <div className="flex items-center border-b pb-1 mt-2 px-1">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                            {new Date(session.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h3>
                    </div>

                    {relevantExercises.map(exercise => (
                        <Card key={exercise.id} className="overflow-hidden border-l-4 border-l-primary shadow-sm relative group">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-1 right-1 h-6 w-6 text-muted-foreground/50 hover:text-destructive opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteExercise(exercise.id)}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                            <CardContent className="p-3 pr-8">
                                <div className="flex justify-between items-baseline mb-2">
                                    <h4 className="font-bold text-base">{exercise.name}</h4>
                                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">{exercise.muscleGroup}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {exercise.sets.map((set, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs font-mono">
                                            {set.reps}x {set.weight}kg
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )
          })
        )}
      </div>
    </div>
  )
}
