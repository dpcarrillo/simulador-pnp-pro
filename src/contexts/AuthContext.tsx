import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'

type Usuario = {
  id: string
  auth_user_id: string
  nombre: string
  correo: string
  rol: string
  estado: string
  fecha_vencimiento: string
}

type AuthContextType = {
  usuario: Usuario | null
  loading: boolean
  setUsuario: (usuario: Usuario | null) => void
  logout: () => Promise<void>
}

const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  )

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [usuario, setUsuario] =
    useState<Usuario | null>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    verificarSesion()
  }, [])

  async function verificarSesion() {
    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      setUsuario(null)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_user_id', session.user.id)
      .single()

    if (error || !data) {
      console.error(error)
      setUsuario(null)
      setLoading(false)
      return
    }

    setUsuario(data)
    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        setUsuario,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}