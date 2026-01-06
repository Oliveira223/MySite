"use client"

import { useRef } from 'react'
import { logStudySession } from '@/app/studies/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, BookOpen } from "lucide-react"

type Subject = {
    id: string
    name: string
    color: string
}

export function StudiesLog({ subjects }: { subjects: Subject[] }) {
    const logSessionFormRef = useRef<HTMLFormElement>(null)

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Nova Sessão</CardTitle>
                <CardDescription>Registre o tempo dedicado e o que você estudou.</CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={logSessionFormRef} action={async (formData) => {
                    const subjectId = formData.get('subjectId') as string
                    const duration = parseInt(formData.get('duration') as string)
                    const notes = formData.get('notes') as string
                    
                    if (subjectId && duration) {
                        await logStudySession(subjectId, duration, notes)
                        logSessionFormRef.current?.reset()
                    }
                }} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="subjectId">Matéria</Label>
                        <Select name="subjectId" required>
                            <SelectTrigger id="subjectId" className="h-11">
                                <SelectValue placeholder="Selecione a matéria..." />
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
                            <Clock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input 
                                id="duration" 
                                type="number" 
                                name="duration" 
                                placeholder="Ex: 45" 
                                required 
                                className="pl-10 h-11"
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">O que você estudou?</Label>
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input 
                                id="notes" 
                                name="notes" 
                                placeholder="Ex: Cap. 4 de História, Resumo de Física..." 
                                className="pl-10 h-11"
                            />
                        </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full h-12 text-base">
                        Salvar Sessão
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
