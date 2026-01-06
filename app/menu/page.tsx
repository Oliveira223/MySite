import { cookies } from 'next/headers'
import Link from "next/link"
import { LoginForm } from './login-form'

export default async function MenuPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('auth_menu')?.value === 'true'

  if (!isAuthenticated) {
    return (
      <div className="grid items-center justify-items-center min-h-screen p-8">
        <main className="flex flex-col gap-8 items-center w-full max-w-md">
          <h1 className="text-2xl font-bold">Área Restrita</h1>
          <LoginForm />
        </main>
      </div>
    )
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Painel Oliveira223</h1>
        
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a 
            href="http://dashboard.oliveira223.com.br" 
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            VPS Dashboard
          </a>
          <Link 
            href="/gym"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
          >
            Academia
          </Link>
          <Link 
            href="/studies"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
          >
            Estudos
          </Link>
        </div>
      </main>
    </div>
  )
}
