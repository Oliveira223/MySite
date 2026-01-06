'use server'

import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const password = formData.get('password')
  const correctPassword = process.env.MENU_PASSWORD || 'admin123'
  
  if (password === correctPassword) {
    // Expires in 7 days
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const cookieStore = await cookies()
    cookieStore.set('auth_menu', 'true', { 
      httpOnly: true, 
      path: '/',
      expires
    })
    return { success: true }
  }
  
  return { success: false, error: 'Senha incorreta' }
}
