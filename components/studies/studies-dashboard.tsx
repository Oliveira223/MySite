"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createTask, toggleTaskStatus, deleteTask, logStudySession } from '@/app/studies/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Clock, ListTodo, CheckCircle2, Circle, Trash2, Calendar as CalendarIcon, BookOpen, Plus } from "lucide-react"
import { StudiesSubjects } from './studies-subjects'
import { StudiesHistory } from './studies-history'
import { StudiesCalendar } from './studies-calendar'

type Subject = {
    id: string
    name: string
    color: string
    totalMinutes: number
    minutesThisWeek: number
    averageGrade: number | null
    grades: any[]
}

type Task = {
    id: string
    title: string
    status: string
    dueDate: Date | null
    type: string
    subjectId: string | null
    subject: { name: string, color: string } | null
}

type Session = {
    id: string
    duration: number
    date: string
    notes: string | null
    subject: {
        name: string
        color: string
    }
}

type Stats = {
    totalMinutes: number
    minutesThisWeek: number
    heatmapData: { date: string, count: number }[]
}

const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round(totalMinutes % 60)
    
    if (hours > 0 && minutes > 0) return `${hours}h${minutes}min`
    if (hours > 0) return `${hours}h`
    return `${minutes}min`
}

export function StudiesDashboard({ subjects, tasks, stats, recentSessions, defaultTab = 'overview', defaultAction }: { subjects: Subject[], tasks: Task[], stats: Stats, recentSessions: Session[], defaultTab?: string, defaultAction?: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
    const [isLogSessionOpen, setIsLogSessionOpen] = useState(false)
    const [activeTab, setActiveTab] = useState(defaultTab)

    useEffect(() => {
        if (defaultAction === 'log') setIsLogSessionOpen(true)
        if (defaultAction === 'task') setIsAddTaskOpen(true)
    }, [defaultAction])

    useEffect(() => {
        setActiveTab(defaultTab)
    }, [defaultTab])

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', value)
        params.delete('action')
        router.replace(`${pathname}?${params.toString()}`)
    }

    const closeLogSession = () => {
        setIsLogSessionOpen(false)
        const params = new URLSearchParams(searchParams.toString())
        if (params.get('action') === 'log') {
            params.delete('action')
            router.replace(`${pathname}?${params.toString()}`)
        }
    }

    const closeAddTask = () => {
        setIsAddTaskOpen(false)
        const params = new URLSearchParams(searchParams.toString())
        if (params.get('action') === 'task') {
            params.delete('action')
            router.replace(`${pathname}?${params.toString()}`)
        }
    }
    
    // Heatmap Logic
    const today = new Date()
    const daysToShow = 119 // ~4 meses
    const heatmapDates = Array.from({ length: daysToShow + 1 }, (_, i) => {
        const d = new Date(today)
        d.setDate(d.getDate() - (daysToShow - i))
        return d.toISOString().split('T')[0]
    })

    const getIntensity = (date: string) => {
        const entry = stats.heatmapData.find(d => d.date === date)
        const minutes = entry ? entry.count : 0
        
        if (minutes === 0) return 'bg-muted/40'
        if (minutes < 30) return 'bg-green-200 dark:bg-green-900/50'
        if (minutes < 60) return 'bg-green-400 dark:bg-green-700'
        if (minutes < 120) return 'bg-green-500 dark:bg-green-600'
        return 'bg-green-600 dark:bg-green-500' // Hardcore
    }

    const getTooltip = (date: string) => {
        const entry = stats.heatmapData.find(d => d.date === date)
        const minutes = entry ? entry.count : 0
        const dateObj = new Date(date + 'T00:00:00') // Force local time roughly
        const dateStr = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
        
        if (minutes === 0) return `${dateStr}: Sem estudos`
        return `${dateStr}: ${formatDuration(minutes)}`
    }

    const getTitle = () => {
        switch (activeTab) {
            case 'subjects': return 'Minhas Matérias'
            case 'calendar': return 'Calendário de Provas'
            default: return 'Visão Geral'
        }
    }

    // Ranking de Matérias
    const sortedSubjects = [...subjects].sort((a, b) => b.totalMinutes - a.totalMinutes).slice(0, 5)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">{getTitle()}</h2>
                {activeTab === 'overview' && (
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono font-medium text-sm">
                            {formatDuration(stats.minutesThisWeek)}
                        </span>
                    </div>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                
                <TabsContent value="overview" className="space-y-8">
                    {/* 1. Ações Rápidas (Quadrados) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div 
                            onClick={() => setIsLogSessionOpen(true)}
                            className="group cursor-pointer flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all h-32 md:h-40"
                        >
                            <div className="p-3 rounded-full bg-background shadow-sm group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <span className="font-semibold text-primary">Adicionar Sessão</span>
                        </div>

                        <div 
                            onClick={() => setIsAddTaskOpen(true)}
                            className="group cursor-pointer flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/5 transition-all h-32 md:h-40"
                        >
                            <div className="p-3 rounded-full bg-background shadow-sm group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <span className="font-semibold text-muted-foreground group-hover:text-primary">Adicionar Tarefa</span>
                        </div>
                    </div>

                    {/* 2. Lista de Tarefas */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <ListTodo className="w-5 h-5" /> Lista de Tarefas
                            </h3>
                        </div>
                        <Card>
                            <CardContent className="p-0">
                                {tasks.length === 0 && (
                                    <div className="text-center p-8 text-muted-foreground">
                                        <p>Nenhuma tarefa pendente.</p>
                                        <p className="text-xs opacity-70 mt-1">Aproveite para descansar ou adiantar os estudos!</p>
                                    </div>
                                )}
                                {tasks.map((task, i) => (
                                    <div key={task.id} className={`flex items-start gap-3 p-4 border-b last:border-0 ${task.status === 'DONE' ? 'bg-muted/30' : ''}`}>
                                        <button 
                                            onClick={() => toggleTaskStatus(task.id, task.status)}
                                            className={`mt-1 transition-colors ${task.status === 'DONE' ? 'text-green-500' : 'text-muted-foreground hover:text-primary'}`}
                                        >
                                            {task.status === 'DONE' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-medium truncate ${task.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>
                                                {task.title}
                                            </h4>
                                            <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                                {task.subject && (
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.subject.color }} />
                                                        <span className="text-muted-foreground">{task.subject.name}</span>
                                                    </div>
                                                )}
                                                {task.dueDate && (
                                                    <span className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                                        <CalendarIcon className="w-3 h-3" />
                                                        {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                                {task.type === 'EXAM' && <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">PROVA</Badge>}
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-muted-foreground/50 hover:text-destructive shrink-0"
                                            onClick={() => deleteTask(task.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* 3. Dashboard (Métricas) */}
                    <div className="space-y-6 pt-4 border-t">
                        <h3 className="text-lg font-semibold">Dashboard</h3>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Bloco 1: Horas Totais */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Tempo Total de Estudo</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-full">
                                            <GraduationCap className="w-8 h-8 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold">{formatDuration(stats.totalMinutes)}</div>
                                            <p className="text-xs text-muted-foreground">acumulados em todas as matérias</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Bloco 2: Ranking de Matérias */}
                            <Card className="md:row-span-2">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Top Matérias Estudadas</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {sortedSubjects.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Nenhuma matéria estudada ainda.</p>
                                    ) : (
                                        sortedSubjects.map((subject, index) => (
                                            <div key={subject.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="font-mono text-sm font-bold text-muted-foreground w-4">{index + 1}</div>
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                                                    <span className="font-medium text-sm">{subject.name}</span>
                                                </div>
                                                <span className="text-sm font-mono text-muted-foreground">
                                                    {formatDuration(subject.totalMinutes)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>

                            {/* Bloco 3: Consistência (Heatmap) */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Consistência</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                                        {heatmapDates.map(date => (
                                            <div 
                                                key={date} 
                                                title={getTooltip(date)}
                                                className={`w-2.5 h-2.5 rounded-sm ${getIntensity(date)} transition-colors hover:ring-1 ring-offset-1 ring-foreground/20`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground justify-end">
                                        <span>Menos</span>
                                        <div className="w-2.5 h-2.5 rounded-sm bg-muted/40" />
                                        <div className="w-2.5 h-2.5 rounded-sm bg-green-200 dark:bg-green-900/50" />
                                        <div className="w-2.5 h-2.5 rounded-sm bg-green-400 dark:bg-green-700" />
                                        <div className="w-2.5 h-2.5 rounded-sm bg-green-600 dark:bg-green-500" />
                                        <span>Mais</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                </TabsContent>

                    <TabsContent value="subjects">
                        <StudiesSubjects subjects={subjects} tasks={tasks} />
                    </TabsContent>

                    <TabsContent value="calendar">
                        <StudiesCalendar tasks={tasks} />
                    </TabsContent>
                </Tabs>

            {/* Add Task Dialog */}
            <Dialog open={isAddTaskOpen} onOpenChange={(open) => open ? setIsAddTaskOpen(true) : closeAddTask()}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Nova Tarefa / Prova</DialogTitle></DialogHeader>
                    <form action={async (formData) => {
                        const title = formData.get('title') as string
                        const subjectId = formData.get('subjectId') as string
                        const dateStr = formData.get('date') as string
                        const type = formData.get('type') as string
                        
                        const date = dateStr ? new Date(dateStr) : null

                        if (title) {
                            await createTask(title, subjectId, date, type)
                            closeAddTask()
                        }
                    }} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Título</Label>
                            <Input name="title" required placeholder="Ex: Prova de Cálculo" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Matéria (Opcional)</Label>
                                <Select name="subjectId">
                                    <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Geral</SelectItem>
                                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select name="type" defaultValue="TASK">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TASK">Tarefa</SelectItem>
                                        <SelectItem value="EXAM">Prova</SelectItem>
                                        <SelectItem value="ASSIGNMENT">Trabalho</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Data de Entrega/Prova</Label>
                            <Input name="date" type="date" />
                        </div>
                        <Button type="submit" className="w-full">Criar</Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Log Session Dialog */}
            <Dialog open={isLogSessionOpen} onOpenChange={(open) => open ? setIsLogSessionOpen(true) : closeLogSession()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Sessão de Estudo</DialogTitle>
                        <DialogDescription>Registre o tempo dedicado e o que você estudou.</DialogDescription>
                    </DialogHeader>
                    <form action={async (formData) => {
                        const subjectId = formData.get('subjectId') as string
                        const duration = parseInt(formData.get('duration') as string)
                        const notes = formData.get('notes') as string
                        
                        if (subjectId && duration) {
                            await logStudySession(subjectId, duration, notes)
                            closeLogSession()
                        }
                    }} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subjectId">Matéria</Label>
                            <Select name="subjectId" required>
                                <SelectTrigger id="subjectId">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map(sub => (
                                        <SelectItem key={sub.id} value={sub.id}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                                                {sub.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">Tempo (minutos)</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="duration" 
                                    type="number" 
                                    name="duration" 
                                    placeholder="Ex: 45" 
                                    required 
                                    className="pl-9"
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">O que você estudou?</Label>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="notes" 
                                    name="notes" 
                                    placeholder="Ex: Cap. 4, Resumo..." 
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full">Salvar Sessão</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
