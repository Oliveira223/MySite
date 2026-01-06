"use client"

import { useState, useRef } from 'react'
import { createSubject, deleteSubject, updateSubject, addGrade, deleteGrade, toggleTaskStatus } from '@/app/studies/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
    BookOpen, 
    Plus, 
    Clock, 
    GraduationCap, 
    Trash2, 
    Pencil, 
    ChevronDown, 
    ChevronUp, 
    MoreVertical,
    CheckCircle2,
    Circle,
    Calendar as CalendarIcon
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type Subject = {
    id: string
    name: string
    color: string
    totalMinutes: number
    averageGrade: number | null
    grades: { id: string, name: string, value: number, maxValue: number, weight: number }[]
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

export function StudiesSubjects({ subjects, tasks }: { subjects: Subject[], tasks: Task[] }) {
    const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false)
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
    const [managingGradesSubject, setManagingGradesSubject] = useState<Subject | null>(null)
    const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null)
    const gradeFormRef = useRef<HTMLFormElement>(null)

    const formatDuration = (totalMinutes: number) => {
        const hours = Math.floor(totalMinutes / 60)
        const minutes = Math.round(totalMinutes % 60)
        
        if (hours > 0 && minutes > 0) return `${hours}h${minutes}min`
        if (hours > 0) return `${hours}h`
        return `${minutes}min`
    }

    const toggleExpand = (id: string) => {
        setExpandedSubjectId(expandedSubjectId === id ? null : id)
    }

    const getSubjectTasks = (subjectId: string) => tasks.filter(t => t.subjectId === subjectId)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Matérias
                </h2>
                <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" /> Nova Matéria
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Nova Matéria</DialogTitle></DialogHeader>
                        <form action={async (formData) => {
                            const name = formData.get('name') as string
                            const color = formData.get('color') as string
                            if (name) {
                                await createSubject(name, color)
                                setIsAddSubjectOpen(false)
                            }
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome da Matéria</Label>
                                <Input name="name" required placeholder="Ex: Física Quântica" />
                            </div>
                            <div className="space-y-2">
                                <Label>Cor</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#64748b'].map(c => (
                                        <label key={c} className="cursor-pointer">
                                            <input type="radio" name="color" value={c} className="peer sr-only" defaultChecked={c === '#3b82f6'} />
                                            <div className="w-8 h-8 rounded-full bg-current peer-checked:ring-2 peer-checked:ring-offset-2 ring-primary transition-all" style={{ color: c }} />
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Criar Matéria</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-3">
                {subjects.length === 0 && (
                    <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                        Nenhuma matéria cadastrada.
                    </div>
                )}
                {subjects.map(sub => (
                    <Card key={sub.id} className={`overflow-hidden transition-all border-l-4 ${expandedSubjectId === sub.id ? 'shadow-md' : 'hover:shadow-sm'}`} style={{ borderLeftColor: sub.color }}>
                        <CardContent className="p-0">
                            <div className="p-4 flex items-start justify-between cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => toggleExpand(sub.id)}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg leading-none">{sub.name}</h3>
                                        {getSubjectTasks(sub.id).filter(t => t.status === 'PENDING').length > 0 && (
                                            <Badge variant="secondary" className="text-xs font-normal text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400 hover:bg-orange-100 border-orange-200 dark:border-orange-800">
                                                {getSubjectTasks(sub.id).filter(t => t.status === 'PENDING').length} pendente{getSubjectTasks(sub.id).filter(t => t.status === 'PENDING').length !== 1 && 's'}
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" /> 
                                            {formatDuration(sub.totalMinutes)}
                                        </span>
                                        {sub.averageGrade !== null && (
                                            <span className="flex items-center gap-1.5">
                                                <GraduationCap className="w-3.5 h-3.5" /> 
                                                Média: {sub.averageGrade.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setManagingGradesSubject(sub)}
                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                        title="Notas"
                                    >
                                        <GraduationCap className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setEditingSubject(sub)}
                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                        title="Editar"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <div className={`p-1.5 rounded-full transition-transform duration-200 ${expandedSubjectId === sub.id ? 'rotate-180 bg-muted' : ''}`}>
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedSubjectId === sub.id && (
                                <div className="border-t px-4 py-3 bg-muted/5 animate-in slide-in-from-top-1 duration-200">
                                    {getSubjectTasks(sub.id).filter(t => t.status === 'PENDING').length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic pl-1">Nenhuma tarefa pendente.</p>
                                    ) : (
                                        <div className="flex flex-col">
                                            {getSubjectTasks(sub.id).filter(t => t.status === 'PENDING').map(task => (
                                                <div key={task.id} className="group flex items-center gap-3 py-2 px-2 hover:bg-muted/50 rounded-md transition-colors -mx-2">
                                                    <button onClick={() => toggleTaskStatus(task.id, task.status)} className="text-muted-foreground hover:text-primary transition-colors">
                                                        <Circle className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm flex-1 text-foreground/80 group-hover:text-foreground transition-colors">{task.title}</span>
                                                    {task.dueDate && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                                                            <CalendarIcon className="w-3 h-3" />
                                                            {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Matéria</DialogTitle>
                    </DialogHeader>
                    {editingSubject && (
                        <form action={async (formData) => {
                            const name = formData.get('name') as string
                            const color = formData.get('color') as string
                            if (name) {
                                await updateSubject(editingSubject.id, name, color)
                                setEditingSubject(null)
                            }
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome</Label>
                                <Input name="name" defaultValue={editingSubject.name} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Cor</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#64748b'].map(c => (
                                        <label key={c} className="cursor-pointer">
                                            <input type="radio" name="color" value={c} className="peer sr-only" defaultChecked={c === editingSubject.color} />
                                            <div className="w-8 h-8 rounded-full bg-current peer-checked:ring-2 peer-checked:ring-offset-2 ring-primary transition-all" style={{ color: c }} />
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button 
                                    type="button" 
                                    variant="destructive" 
                                    onClick={async () => {
                                        if(confirm('Tem certeza? Isso apagará todo o histórico desta matéria.')) {
                                            await deleteSubject(editingSubject.id)
                                            setEditingSubject(null)
                                        }
                                    }}
                                >
                                    Excluir Matéria
                                </Button>
                                <Button type="submit">Salvar Alterações</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Grade Management Dialog */}
            <Dialog open={!!managingGradesSubject} onOpenChange={(open) => !open && setManagingGradesSubject(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Notas: {managingGradesSubject?.name}</DialogTitle>
                    </DialogHeader>
                    {managingGradesSubject && (
                        <div className="space-y-6">
                            {/* List */}
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                {managingGradesSubject.grades.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic text-center py-4">Nenhuma nota registrada.</p>
                                )}
                                {managingGradesSubject.grades.map(grade => (
                                    <div key={grade.id} className="flex items-center justify-between p-3 border rounded-md bg-background">
                                        <div>
                                            <div className="font-medium text-sm">{grade.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {grade.value}/{grade.maxValue} <span className="text-muted-foreground/50">•</span> Peso {grade.weight}
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={async () => await deleteGrade(grade.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Add Form */}
                            <form ref={gradeFormRef} action={async (formData) => {
                                const name = formData.get('name') as string
                                const value = parseFloat(formData.get('value') as string)
                                const maxValue = parseFloat(formData.get('maxValue') as string)
                                const weight = parseFloat(formData.get('weight') as string)
                                
                                if (name && !isNaN(value) && !isNaN(weight)) {
                                    await addGrade(managingGradesSubject.id, name, value, maxValue, weight)
                                    gradeFormRef.current?.reset()
                                }
                            }} className="p-4 border rounded-lg bg-muted/10 space-y-3">
                                <div className="text-sm font-medium flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" /> Adicionar Nova Nota
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <Input name="name" placeholder="Nome da Avaliação (ex: Prova 1)" required className="bg-background" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Nota Obtida</Label>
                                        <Input type="number" step="0.1" name="value" placeholder="0.0" required className="bg-background" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Nota Máxima</Label>
                                        <Input type="number" step="0.1" name="maxValue" defaultValue="10" placeholder="10.0" required className="bg-background" />
                                    </div>
                                    <div className="col-span-2 flex items-end gap-3">
                                        <div className="space-y-1 flex-1">
                                            <Label className="text-xs">Peso</Label>
                                            <Input type="number" step="0.1" name="weight" defaultValue="1" required className="bg-background" />
                                        </div>
                                        <Button type="submit" className="flex-1">Adicionar</Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
