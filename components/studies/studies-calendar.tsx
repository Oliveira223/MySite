"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, AlertCircle, GraduationCap, FileText } from "lucide-react"

// Definição do tipo Task (Tarefa) que esperamos receber
type Task = {
    id: string
    title: string
    status: string
    dueDate: Date | null
    type: string
    subjectId: string | null
    subject: { name: string, color: string } | null
}

export function StudiesCalendar({ tasks }: { tasks: Task[] }) {
    // 1. FILTRAGEM E ORDENAÇÃO
    // Filtramos apenas tarefas que são PROVA (EXAM) ou TRABALHO (ASSIGNMENT)
    // E que obrigatoriamente tenham uma data de entrega (dueDate)
    const events = tasks.filter(t => 
        (t.type === 'EXAM' || t.type === 'ASSIGNMENT') && 
        t.dueDate // Must have a date
    ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()) // Ordena por data (mais recente primeiro)

    // 2. AGRUPAMENTO POR MÊS
    // Criamos um objeto onde a chave é o nome do mês (ex: "março de 2026") e o valor é a lista de tarefas daquele mês
    const groupedEvents: Record<string, Task[]> = {}
    
    events.forEach(event => {
        if (!event.dueDate) return
        const date = new Date(event.dueDate)
        // Gera a chave do grupo 
        const key = date.toLocaleDateString('pt-BR', { month: 'long'})
        
        if (!groupedEvents[key]) {
            groupedEvents[key] = []
        }
        groupedEvents[key].push(event)
    })

    // Lista de meses para iterar na renderização
    const months = Object.keys(groupedEvents)

    return (
        <div className="space-y-8">
            {/* Estado Vazio: Mostra mensagem se não houver provas/trabalhos */}
            {events.length === 0 && (
                <div className="text-center p-12 border-2 border-dashed rounded-lg bg-muted/5">
                    <div className="flex justify-center mb-4">
                        <CalendarIcon className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium text-muted-foreground">Nenhuma prova ou trabalho agendado</h3>
                    <p className="text-sm text-muted-foreground/80">Adicione datas importantes para visualizá-las aqui.</p>
                </div>
            )}

            {/* Renderização dos Grupos de Meses */}
            {months.map(month => (
                <div key={month} className="space-y-2">
                    {/* Cabeçalho do Mês (ex: Março de 2026) */}
                    <h3 className="text-lg font-semibold capitalize flex items-center gap-2 text-primary">
                        <CalendarIcon className="w-5 h-5" />
                        {month}
                    </h3>
                    
                    {/* Grid de Cards (Provas/Trabalhos) */}
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {groupedEvents[month].map(event => (
                            <Card key={event.id} className={`border-l-4 overflow-hidden transition-all hover:shadow-sm ${event.status === 'DONE' ? 'opacity-60' : ''}`} style={{ borderLeftColor: event.subject?.color || '#888' }}>
                                <CardContent className="px-4 py-0 flex items-center justify-between gap-4">
                                    {/* Bloco Esquerdo: Informações da Tarefa (Título, Matéria e Tipo) */}
                                    <div className="flex flex-col gap-1.5 min-w-0">
                                        <h4 className={`font-semibold text-sm leading-tight truncate ${event.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>
                                            {event.title}
                                        </h4>
                                        
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                            {/* Matéria (com bolinha colorida) */}
                                            {event.subject && (
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: event.subject.color }} />
                                                    <span className="truncate font-medium">{event.subject.name}</span>
                                                </div>
                                            )}
                                            
                                            {/* Separador */}
                                            <div className="w-px h-2.5 bg-border shrink-0" />
                                            
                                            {/* Tipo: Prova ou Trabalho (com ícone) */}
                                            <div className={`flex items-center gap-1 text-[10px] shrink-0 ${event.type === 'EXAM' ? 'text-red-600/80 dark:text-red-400' : 'text-blue-600/80 dark:text-blue-400'}`}>
                                                {event.type === 'EXAM' ? <GraduationCap className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                                <span className="uppercase font-bold tracking-wider">
                                                    {event.type === 'EXAM' ? 'Prova' : 'Trabalho'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bloco Direito: Data de Entrega (Dia grande, Mês abreviado) */}
                                    {event.dueDate && (
                                        <div className={`text-xs font-medium whitespace-nowrap flex flex-col items-end justify-center shrink-0 ${
                                            new Date(event.dueDate) < new Date() && event.status !== 'DONE' 
                                            ? 'text-red-500' 
                                            : 'text-muted-foreground'
                                        }`}>
                                            <span className="text-[13px] font-bold">
                                                {new Date(event.dueDate).toLocaleDateString('pt-BR', { day: '2-digit' })}
                                            </span>
                                            <span className="text-[10px] uppercase opacity-80">
                                                {new Date(event.dueDate).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
