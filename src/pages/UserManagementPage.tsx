import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Usuario = {
  id: string
  auth_id: string | null
  nombre: string
  correo: string
  rol: string
  estado: string
  fecha_vencimiento: string
  created_at: string
}

type Props = {
  regresar?: () => void
}

const usuarioVacio = {
  auth_id: '',
  nombre: '',
  correo: '',
  rol: 'alumno',
  estado: 'activo',
  fecha_vencimiento: '2026-12-31',
}

export default function UserManagementPage({ regresar }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const [form, setForm] = useState(usuarioVacio)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  async function cargarUsuarios() {
    setLoading(true)

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setUsuarios(data || [])
    setLoading(false)
  }

  async function buscarUsuarios() {
    setLoading(true)

    let query = supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (busqueda.trim()) {
      query = query.or(
        `nombre.ilike.%${busqueda}%,correo.ilike.%${busqueda}%,rol.ilike.%${busqueda}%,estado.ilike.%${busqueda}%`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setUsuarios(data || [])
    setLoading(false)
  }

  function cambiarCampo(campo: keyof typeof usuarioVacio, valor: string) {
    setForm(prev => ({
      ...prev,
      [campo]: valor,
    }))
  }

  async function guardarUsuario() {
    if (!form.nombre || !form.correo || !form.fecha_vencimiento) {
      alert('Complete nombre, correo y fecha de vencimiento')
      return
    }

    if (editandoId) {
      const { error } = await supabase
        .from('usuarios')
        .update({
          auth_id: form.auth_id || null,
          nombre: form.nombre,
          correo: form.correo,
          rol: form.rol,
          estado: form.estado,
          fecha_vencimiento: form.fecha_vencimiento,
        })
        .eq('id', editandoId)

      if (error) {
        console.error(error)
        alert('Error al actualizar usuario')
        return
      }

      alert('Usuario actualizado')
    } else {
      const { error } = await supabase.from('usuarios').insert({
        auth_id: form.auth_id || null,
        nombre: form.nombre,
        correo: form.correo,
        rol: form.rol,
        estado: form.estado,
        fecha_vencimiento: form.fecha_vencimiento,
      })

      if (error) {
        console.error(error)
        alert('Error al crear usuario')
        return
      }

      alert('Usuario creado')
    }

    limpiarFormulario()
    buscarUsuarios()
  }

  function editarUsuario(usuario: Usuario) {
    setEditandoId(usuario.id)

    setForm({
      auth_id: usuario.auth_id || '',
      nombre: usuario.nombre || '',
      correo: usuario.correo || '',
      rol: usuario.rol || 'alumno',
      estado: usuario.estado || 'activo',
      fecha_vencimiento: usuario.fecha_vencimiento || '2026-12-31',
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function limpiarFormulario() {
    setEditandoId(null)
    setForm(usuarioVacio)
  }

  async function cambiarEstado(usuario: Usuario) {
    const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo'

    const { error } = await supabase
      .from('usuarios')
      .update({ estado: nuevoEstado })
      .eq('id', usuario.id)

    if (error) {
      console.error(error)
      alert('Error al cambiar estado')
      return
    }

    buscarUsuarios()
  }

  async function renovarLicencia(usuario: Usuario) {
    const nuevaFecha = prompt(
      'Ingrese nueva fecha de vencimiento: YYYY-MM-DD',
      usuario.fecha_vencimiento
    )

    if (!nuevaFecha) return

    const { error } = await supabase
      .from('usuarios')
      .update({
        fecha_vencimiento: nuevaFecha,
        estado: 'activo',
      })
      .eq('id', usuario.id)

    if (error) {
      console.error(error)
      alert('Error al renovar licencia')
      return
    }

    buscarUsuarios()
  }

  async function eliminarUsuario(usuario: Usuario) {
    const confirmar = window.confirm(
      `¿Eliminar al usuario ${usuario.nombre}?`
    )

    if (!confirmar) return

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', usuario.id)

    if (error) {
      console.error(error)
      alert('No se pudo eliminar. Este usuario puede tener simulacros o registros relacionados.')
      return
    }

    buscarUsuarios()
  }

  function licenciaVencida(fecha: string) {
    return new Date(fecha) < new Date()
  }

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Gestión de Usuarios</h1>

        <br />

        {regresar && (
          <>
            <button className="secondary" onClick={regresar}>
              Volver al Panel
            </button>

            <br />
            <br />
          </>
        )}

        <h3>{editandoId ? 'Editar usuario' : 'Crear perfil de usuario'}</h3>

        <br />

        <p>
          Recuerda: el usuario debe existir también en Supabase Authentication.
          Copia su UID en el campo auth_id.
        </p>

        <br />

        <input
          placeholder="Auth ID / UID de Supabase Auth"
          value={form.auth_id}
          onChange={e => cambiarCampo('auth_id', e.target.value)}
        />

        <br />
        <br />

        <input
          placeholder="Nombre completo"
          value={form.nombre}
          onChange={e => cambiarCampo('nombre', e.target.value)}
        />

        <br />
        <br />

        <input
          placeholder="Correo"
          value={form.correo}
          onChange={e => cambiarCampo('correo', e.target.value)}
        />

        <br />
        <br />

        <select
          value={form.rol}
          onChange={e => cambiarCampo('rol', e.target.value)}
        >
          <option value="alumno">Alumno</option>
          <option value="admin">Administrador</option>
        </select>

        <br />
        <br />

        <select
          value={form.estado}
          onChange={e => cambiarCampo('estado', e.target.value)}
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>

        <br />
        <br />

        <input
          type="date"
          value={form.fecha_vencimiento}
          onChange={e => cambiarCampo('fecha_vencimiento', e.target.value)}
        />

        <br />
        <br />

        <button onClick={guardarUsuario}>
          {editandoId ? 'Actualizar usuario' : 'Crear perfil'}
        </button>

        {' '}

        {editandoId && (
          <button className="secondary" onClick={limpiarFormulario}>
            Cancelar
          </button>
        )}

        <hr style={{ margin: '30px 0' }} />

        <h3>Buscar usuarios</h3>

        <br />

        <input
          placeholder="Buscar por nombre, correo, rol o estado"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />

        <br />
        <br />

        <button onClick={buscarUsuarios}>
          Buscar
        </button>

        {' '}

        <button className="secondary" onClick={cargarUsuarios}>
          Limpiar
        </button>

        <br />
        <br />

        <h3>Usuarios registrados</h3>

        <br />

        {loading && <p>Cargando usuarios...</p>}

        {!loading && (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Vencimiento</th>
                  <th>Licencia</th>
                  <th>Auth</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.correo}</td>
                    <td>{usuario.rol}</td>
                    <td>{usuario.estado}</td>
                    <td>{usuario.fecha_vencimiento}</td>
                    <td>
                      {licenciaVencida(usuario.fecha_vencimiento)
                        ? 'Vencida'
                        : 'Activa'}
                    </td>
                    <td>{usuario.auth_id ? 'Vinculado' : 'Pendiente'}</td>
                    <td>
                      <button onClick={() => editarUsuario(usuario)}>
                        Editar
                      </button>

                      {' '}

                      <button onClick={() => cambiarEstado(usuario)}>
                        {usuario.estado === 'activo'
                          ? 'Desactivar'
                          : 'Activar'}
                      </button>

                      {' '}

                      <button onClick={() => renovarLicencia(usuario)}>
                        Renovar
                      </button>

                      {' '}

                      <button onClick={() => eliminarUsuario(usuario)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}