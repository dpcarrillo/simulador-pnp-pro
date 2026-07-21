import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { registrarAuditoria } from '../lib/auditoria'

export default function LoginPage() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { setUsuario } = useAuth()

  async function ingresar() {
    setError('')
    setLoading(true)

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: correo,
        password,
      })

    if (authError || !authData.user) {
      setError('Credenciales incorrectas')
      setLoading(false)
      return
    }

    const { data: usuarioData, error: usuarioError } =
      await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single()

    if (usuarioError || !usuarioData) {
      await supabase.auth.signOut()
      setError('No existe perfil vinculado para este usuario')
      setLoading(false)
      return
    }

    if (usuarioData.estado !== 'activo') {
      await supabase.auth.signOut()
      setError('Cuenta desactivada')
      setLoading(false)
      return
    }

    const hoy = new Date()
    const vencimiento = new Date(usuarioData.fecha_vencimiento)

    if (vencimiento < hoy) {
      await supabase.auth.signOut()
      setError('Licencia vencida')
      setLoading(false)
      return
    }

    await registrarAuditoria({
      usuario: usuarioData,
      accion: 'LOGIN',
      modulo: 'AUTENTICACIÓN',
      descripcion: `El usuario ${usuarioData.nombre} ingresó al sistema.`,
    })

    setUsuario(usuarioData)
    setLoading(false)
  }

  return (
    <div className="exam-page">
      <div
        className="question-card"
        style={{
          maxWidth: 500,
          margin: '50px auto',
        }}
      >
        <h1>Simulador PNP Pro</h1>

        <br />

        <input
          placeholder="Correo"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button onClick={ingresar} disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <br />
        <br />

        {error && (
          <p style={{ color: '#ef4444' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}