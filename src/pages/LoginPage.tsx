import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { registrarAuditoria } from '../lib/auditoria'
export default function LoginPage() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { setUsuario } = useAuth()
  async function ingresar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading) return
    setError(''); setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: correo.trim(), password })
      if (authError || !authData.user) { setError('No se pudo iniciar sesión. Verifica tus credenciales.'); return }
      const { data: usuarioData, error: usuarioError } = await supabase.from('usuarios').select('*').eq('auth_user_id', authData.user.id).single()
      if (usuarioError || !usuarioData) { await supabase.auth.signOut(); setError('La cuenta no tiene un perfil vinculado. Contacta al administrador.'); return }
      if (usuarioData.estado !== 'activo') { await supabase.auth.signOut(); setError('Tu cuenta está desactivada.'); return }
      if (usuarioData.fecha_vencimiento) {
        const expiration = new Date(`${String(usuarioData.fecha_vencimiento).slice(0, 10)}T23:59:59`)
        if (expiration.getTime() < Date.now()) { await supabase.auth.signOut(); setError('Tu licencia ha vencido.'); return }
      }
      try { await registrarAuditoria({ usuario: usuarioData, accion: 'LOGIN', modulo: 'AUTENTICACIÓN', descripcion: `El usuario ${usuarioData.nombre} ingresó al sistema.` }) } catch (auditError) { console.warn('No se pudo registrar auditoría', auditError) }
      setUsuario(usuarioData)
    } catch (err) { console.error(err); setError('No fue posible conectar con el servicio. Intenta de nuevo.') }
    finally { setLoading(false) }
  }
  return <div className="login-screen"><div className="login-decor decor-one"/><div className="login-decor decor-two"/><div className="login-layout"><section className="login-presentation"><div className="login-brand"><span className="brand-symbol">✦</span><strong>SIMULADOR <em>PNP</em> <small>PRO</small></strong></div><div className="login-copy"><span className="login-overline">PLATAFORMA DE PREPARACIÓN PROFESIONAL</span><h1>Prepárate para<br/><span>tu próximo nivel.</span></h1><p>Entrena, evalúa tus conocimientos y mide tu progreso desde una sola plataforma.</p><div className="login-benefits"><span>✓ Simulacros interactivos</span><span>✓ Progreso personalizado</span><span>✓ Historial de resultados</span></div></div><div className="login-footnote">SIMULADOR PNP PRO · 2026</div></section><section className="login-form-area"><form className="login-card" onSubmit={ingresar}><div className="login-card-icon">✦</div><span className="login-form-eyebrow">BIENVENIDO DE NUEVO</span><h2>Iniciar sesión</h2><p>Ingresa con tus credenciales para continuar.</p><label htmlFor="login-email">Correo electrónico</label><input id="login-email" type="email" autoComplete="username" placeholder="tu@correo.com" required value={correo} onChange={e => setCorreo(e.target.value)}/><label htmlFor="login-password">Contraseña</label><div className="password-field"><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Ingresa tu contraseña" required value={password} onChange={e => setPassword(e.target.value)}/><button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? 'Ocultar' : 'Ver'}</button></div>{error && <div className="login-error" role="alert">{error}</div>}<button className="login-submit" type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar a la plataforma'} <span aria-hidden="true">→</span></button><div className="login-note">¿No tienes acceso? Solicita tus credenciales al administrador.</div></form></section></div></div>
}
