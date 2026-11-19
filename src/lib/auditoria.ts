import { supabase } from './supabase'

type UsuarioAuditoria = {
  id?: string
  auth_user_id?: string
  nombre?: string
  correo?: string
  rol?: string
}

type RegistrarAuditoriaProps = {
  usuario?: UsuarioAuditoria | null
  accion: string
  modulo: string
  descripcion: string
  metadata?: Record<string, any>
}

export async function registrarAuditoria({
  usuario,
  accion,
  modulo,
  descripcion,
  metadata = {},
}: RegistrarAuditoriaProps) {
  const { error } = await supabase
    .from('auditoria')
    .insert({
      usuario_id: usuario?.id || null,
      auth_id: usuario?.auth_user_id || null,
      nombre: usuario?.nombre || 'SIN USUARIO',
      correo: usuario?.correo || 'SIN CORREO',
      rol: usuario?.rol || 'SIN ROL',
      accion,
      modulo,
      descripcion,
      metadata,
    })

  if (error) {
    console.error('Error auditoría:', error)
  }
}