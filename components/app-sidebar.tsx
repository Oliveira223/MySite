'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { 
  Home, 
  Dumbbell, 
  BookOpen, 
  ArrowLeft, 
  LayoutDashboard, 
  ClipboardList, 
  LibraryBig,
  Clock,
  LayoutGrid,
  GraduationCap,
  ListTodo,
  Calendar
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu Principal (Home)
const mainItems = [
  {
    title: "Início",
    url: "/",
    icon: Home,
  },
  {
    title: "Academia",
    url: "/gym",
    icon: Dumbbell,
  },
  {
    title: "Estudos",
    url: "/studies",
    icon: GraduationCap,
  },
]

// Menu Contextual: Academia
const gymItems = [
  {
    title: "Voltar ao Início",
    url: "/",
    icon: ArrowLeft,
    variant: "secondary" // Destaque visual
  },
  {
    title: "Dashboard",
    url: "/gym",
    icon: LayoutDashboard,
  },
  {
    title: "Registro Diário",
    url: "/gym/log",
    icon: ClipboardList,
  },
  {
    title: "Meus Treinos",
    url: "/gym/exercises",
    icon: LibraryBig,
  },
]

// Menu Contextual: Estudos
const studyItems = [
  {
    title: "Voltar ao Início",
    url: "/",
    icon: ArrowLeft,
    variant: "secondary"
  },
  {
    title: "Visão Geral",
    url: "/studies",
    icon: LayoutDashboard,
  },
  {
    title: "Matérias",
    url: "/studies?tab=subjects",
    icon: BookOpen,
  },
  {
    title: "Calendário",
    url: "/studies?tab=calendar",
    icon: Calendar,
  }
]

export function AppSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Lógica simples: Se a URL começa com "/gym", mostra o menu da academia
  const isGymContext = pathname?.startsWith("/gym")
  const isStudyContext = pathname?.startsWith("/studies")

  // Decide quais itens mostrar
  let currentItems = mainItems
  let currentLabel = "Meu Painel"

  if (isGymContext) {
    currentItems = gymItems
    currentLabel = "Módulo Academia"
  } else if (isStudyContext) {
    currentItems = studyItems
    currentLabel = "Módulo Estudos"
  }

  // Helper para verificar ativo
  const isActive = (itemUrl: string) => {
    if (itemUrl === '/') return pathname === '/'
    
    // Se tem query params, compara tudo
    if (itemUrl.includes('?')) {
        const [path, query] = itemUrl.split('?')
        const itemParams = new URLSearchParams(query)
        
        // Verifica path
        if (pathname !== path) return false
        
        // Verifica params
        // Se a url do item é ?tab=subjects, e a url atual é ?tab=subjects&other=1, retorna true
        // Mas vamos simplificar: verifica se o parametro principal bate
        const tab = itemParams.get('tab')
        const action = itemParams.get('action')
        
        if (tab && searchParams?.get('tab') === tab) return true
        if (action && searchParams?.get('action') === action) return true
        
        return false
    }
    
    return pathname === itemUrl
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{currentLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {currentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} className={item.variant === 'secondary' ? 'text-muted-foreground' : ''}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
