"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

type Session = {
    id: string
    date: Date | string
    duration: number
    notes: string | null
    subject: { name: string, color: string }
}

const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round(totalMinutes % 60)
    
    if (hours > 0 && minutes > 0) return `${hours}h${minutes}min`
    if (hours > 0) return `${hours}h`
    return `${minutes}min`
}

export function StudiesHistory({ recentSessions }: { recentSessions: Session[] }) {
    return (
        <div className="space-y-4">
            {recentSessions.length === 0 && (
                <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    Nenhuma sessão registrada ainda.
                </div>
            )}
            {recentSessions.map((session) => (
                <Card key={session.id}>
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge style={{ backgroundColor: session.subject.color }} className="text-white">
                                    {session.subject.name}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    {new Date(session.date).toLocaleDateString('pt-BR', { 
                                        day: 'numeric', 
                                        month: 'long', 
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            {session.notes && (
                                <p className="text-sm mt-1">{session.notes}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 font-bold text-lg whitespace-nowrap">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            {formatDuration(session.duration)}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
