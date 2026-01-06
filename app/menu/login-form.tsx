'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const result = await login(formData)
    if (!result.success) {
      setError(result.error || 'Erro ao entrar')
    } else {
      router.refresh()
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="password">Senha de Acesso</Label>
        <Input type="password" name="password" id="password" placeholder="Digite a senha..." required />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit">Entrar</Button>
    </form>
  )
}
