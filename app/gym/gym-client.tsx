'use client'

import { useState, useEffect } from 'react'
import { createWorkoutSession, addExerciseToWorkout, addSetToExercise, deleteSet } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Dumbbell, Copy, CheckCircle2, Circle, CheckSquare, ChevronDown, ChevronUp, Check, Undo2, Eye, EyeOff, Timer, X } from "lucide-react"

// Tipos
type Set = { id: string; weight: number; reps: number; order: number }
type Exercise = { id: string; name: string; muscleGroup: string | null; sets: Set[] }
type WorkoutSession = { id: string; name: string | null; exercises: Exercise[] }

export function GymClient({ initialSession }: { initialSession: WorkoutSession | null }) {
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false)
  // Estado para exercícios concluídos (minimizados)
  const [collapsedExercises, setCollapsedExercises] = useState<Record<string, boolean>>({})
  // Estado para ocultar exercícios concluídos da visualização
  const [hideCompleted, setHideCompleted] = useState(false)

  // Cronômetro de Descanso
  const [restTimer, setRestTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => prev - 1)
      }, 1000)
    } else if (restTimer === 0) {
      setIsTimerRunning(false)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, restTimer])

  const startRestTimer = (seconds: number) => {
    setRestTimer(seconds)
    setIsTimerRunning(true)
  }

  const stopRestTimer = () => {
    setIsTimerRunning(false)
    setRestTimer(0)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const toggleExerciseCollapse = (exerciseId: string) => {
    setCollapsedExercises(prev => ({ ...prev, [exerciseId]: !prev[exerciseId] }))
  }

  // Ordenar exercícios: Ativos primeiro, Concluídos por último
  const sortedExercises = initialSession?.exercises ? [...initialSession.exercises].sort((a, b) => {
    const aCollapsed = collapsedExercises[a.id] ? 1 : 0
    const bCollapsed = collapsedExercises[b.id] ? 1 : 0
    return aCollapsed - bCollapsed
  }) : []

  // Filtrar exercícios se hideCompleted estiver ativo
  const visibleExercises = sortedExercises.filter(ex => !hideCompleted || !collapsedExercises[ex.id])
  const completedCount = sortedExercises.filter(ex => collapsedExercises[ex.id]).length

  if (!initialSession) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-6 px-4 text-center">
        <div className="bg-primary/10 p-6 rounded-full">
          <Dumbbell className="w-12 h-12 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Hora do Treino!</h2>
          <p className="text-muted-foreground mt-2">Nenhum treino iniciado hoje.</p>
        </div>
        <Button size="lg" className="w-full max-w-xs" onClick={() => createWorkoutSession("Treino do Dia")}>
          Começar Agora
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-32">
      {/* Timer Flutuante (aparece quando ativo) */}
      {isTimerRunning && (
        <div className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5">
            <Timer className="w-5 h-5 animate-pulse" />
            <span className="font-mono font-bold text-lg">{formatTime(restTimer)}</span>
            <button onClick={stopRestTimer} className="hover:bg-primary-foreground/20 rounded-full p-1">
                <X className="w-4 h-4" />
            </button>
        </div>
      )}

      {/* Header Compacto */}
      <header className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-xl font-bold">{initialSession.name}</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        
        <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Exercício
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Exercício</DialogTitle>
            </DialogHeader>
            <form action={async (formData) => {
              const name = formData.get('name') as string
              const muscle = formData.get('muscle') as string
              if (name && muscle) {
                await addExerciseToWorkout(initialSession.id, name, muscle)
                setIsAddExerciseOpen(false)
              }
            }} className="flex flex-col gap-4 mt-2">
              <div className="space-y-2">
                <Label>Grupo Muscular</Label>
                <Select name="muscle" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Peito">Peito</SelectItem>
                    <SelectItem value="Costas">Costas</SelectItem>
                    <SelectItem value="Pernas">Pernas</SelectItem>
                    <SelectItem value="Ombros">Ombros</SelectItem>
                    <SelectItem value="Bíceps">Bíceps</SelectItem>
                    <SelectItem value="Tríceps">Tríceps</SelectItem>
                    <SelectItem value="Abdômen">Abdômen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input name="name" placeholder="Ex: Supino Reto" required autoFocus />
              </div>
              <Button type="submit" size="lg">Adicionar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>
      
      {/* Controles de Visualização (Aparece apenas se houver itens concluídos) */}
      {completedCount > 0 && (
        <div className="flex justify-end">
           <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setHideCompleted(!hideCompleted)}
            className="text-xs text-muted-foreground hover:text-primary gap-1 h-6"
          >
            {hideCompleted ? (
              <>
                <Eye className="w-3 h-3" /> Mostrar {completedCount} concluídos
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" /> Ocultar {completedCount} concluídos
              </>
            )}
          </Button>
        </div>
      )}

      {/* Lista de Exercícios */}
      <div className="flex flex-col gap-6">
        {visibleExercises.map((exercise) => {
          const isCollapsed = collapsedExercises[exercise.id]

          if (isCollapsed) {
            return (
              <div key={exercise.id} className="group flex items-center justify-between py-2 px-1 opacity-50 hover:opacity-100 transition-all">
                <div className="flex items-center gap-2">
                   <CheckSquare className="w-4 h-4 text-muted-foreground" />
                   <span className="font-medium text-sm text-muted-foreground line-through decoration-muted-foreground/50">{exercise.name}</span>
                   <span className="text-xs text-muted-foreground/60">({exercise.sets.length} séries)</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => toggleExerciseCollapse(exercise.id)} 
                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-transparent"
                  title="Reabrir exercício"
                >
                   <Undo2 className="w-4 h-4" />
                </Button>
              </div>
            )
          }

          return (
            <div key={exercise.id} className="flex flex-col gap-3">
              {/* Título do Exercício e Botão Concluir */}
              <div className="flex items-end justify-between px-1">
                <div className="flex-1 mr-2">
                  <div className="flex items-center justify-between">
                     <h3 className="font-bold text-lg text-primary leading-none">{exercise.name}</h3>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground/50 hover:text-destructive -mr-2"
                        onClick={async () => {
                            if (window.confirm('Tem certeza que deseja excluir este exercício?')) {
                                await deleteWorkoutExercise(exercise.id)
                            }
                        }}
                     >
                        <Trash2 className="w-4 h-4" />
                     </Button>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium uppercase">{exercise.muscleGroup}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-muted-foreground hover:text-green-600 hover:bg-green-50 shrink-0" 
                  onClick={() => toggleExerciseCollapse(exercise.id)}
                >
                  <CheckSquare className="w-4 h-4 mr-1" /> Concluir
                </Button>
              </div>

              <Card className="border-none shadow-sm bg-card/50">
                <CardContent className="p-0">
                  {/* Cabeçalho da Tabela */}
                  <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 p-3 text-xs font-semibold text-muted-foreground uppercase border-b bg-muted/30">
                    <div className="text-center">Set</div>
                    <div className="text-center">Reps</div>
                    <div className="text-center">Kg</div>
                    <div className="text-center flex justify-center"><Trash2 className="w-3 h-3" /></div>
                  </div>

                  {/* Lista de Séries */}
                  {exercise.sets.map((set, index) => {
                    return (
                      <div 
                        key={set.id} 
                        className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 p-3 items-center border-b last:border-0"
                      >
                        <div className="text-center font-mono text-sm text-muted-foreground">{index + 1}</div>
                        <div className="text-center font-bold text-lg">{set.reps}</div>
                        <div className="text-center font-bold text-lg">{set.weight}</div>
                        <div className="flex justify-center">
                          <button onClick={() => deleteSet(set.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {/* Área de Ação Rápida */}
                  <div className="p-3 bg-muted/20">
                    <form 
                      action={async (formData) => {
                        const weight = parseFloat(formData.get('weight') as string)
                        const reps = parseInt(formData.get('reps') as string)
                        if (weight && reps) {
                          await addSetToExercise(exercise.id, weight, reps)
                          startRestTimer(90) // Inicia timer de 90s (1min30) automaticamente
                        }
                      }}
                      className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center"
                    >
                      <div className="relative">
                        <Input 
                          type="number" 
                          name="reps" 
                          placeholder="reps" 
                          required 
                          className="h-10 text-center font-bold pr-8"
                          defaultValue={exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].reps : ''} 
                        />
                        <span className="absolute right-2 top-3 text-xs text-muted-foreground">reps</span>
                      </div>

                      <div className="relative">
                        <Input 
                          type="number" 
                          name="weight" 
                          placeholder="kg" 
                          step="0.5" 
                          required 
                          className="h-10 text-center font-bold pr-6" 
                          defaultValue={exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].weight : ''}
                        />
                        <span className="absolute right-2 top-3 text-xs text-muted-foreground">kg</span>
                      </div>
                      
                      <Button type="submit" size="icon" className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90">
                        <Check className="w-5 h-5" />
                      </Button>
                    </form>
                  </div>

                </CardContent>
              </Card>
            </div>
          )
        })}
        
        {initialSession.exercises.length === 0 && (
          <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
            <p>Seu treino está vazio.</p>
            <p className="text-sm mt-1">Adicione o primeiro exercício lá em cima 👆</p>
          </div>
        )}
      </div>
    </div>
  )
}
