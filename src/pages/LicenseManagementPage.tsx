import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Usuario = {
  id: string
  nombre: string
  correo: string
  rol: string
  estado: string
  fecha_vencimiento: string
}

type Props = {
  regresar?: () => void
}

export default function LicenseManagementPage({ regresar }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  async function cargarUsuarios() {
    setLoading(true)

    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, rol, estado, fecha_vencimiento')
      .order('nombre', { ascending: true })

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
      .select('id, nombre, correo, rol, estado, fecha_vencimiento')
      .order('nombre', { ascending: true })

    if (busqueda.trim()) {
      query = query.or(
        `nombre.ilike.%${busqueda}%,correo.ilike.%${busqueda}%,rol.ilike.%${busqueda}%`
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

  function sumarDias(fecha: string, dias: number) {
    const base = new Date(fecha)
    const hoy = new Date()
    const fechaBase = base < hoy ? hoy : base

    fechaBase.setDate(fechaBase.getDate() + dias)

    return fechaBase.toISOString().split('T')[0]
  }

  async function renovar(usuario: Usuario, dias: number) {
    const nuevaFecha = sumarDias(usuario.fecha_vencimiento, dias)

    const confirmar = window.confirm(
      `¿Renovar licencia de ${usuario.nombre} hasta ${nuevaFecha}?`
    )

    if (!confirmar) return

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

  async function fechaPersonalizada(usuario: Usuario) {
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
      alert('Error al actualizar fecha')
      return
    }

    buscarUsuarios()
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

  function licenciaEstado(fecha: string) {
    const hoy = new Date()
    const vencimiento = new Date(fecha)

    if (vencimiento < hoy) {
      return 'Vencida'
    }

    return 'Activa'
  }

  function colorLicencia(fecha: string) {
    const hoy = new Date()
    const vencimiento = new Date(fecha)

    const diferenciaMs = vencimiento.getTime() - hoy.getTime()
    const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24))

    if (dias < 0) return '#ef4444'
    if (dias <= 7) return '#facc15'
    return '#22c55e'
  }

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Gestión de Licencias</h1>

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

        <p>
          Renueva, suspende o activa cuentas de alumnos y administradores.
        </p>

        <br />

        <input
          placeholder="Buscar por nombre, correo o rol"
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
                  <th>Renovar</th>
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
                    <td
                      style={{
                        color: colorLicencia(usuario.fecha_vencimiento),
                        fontWeight: 700,
                      }}
                    >
                      {licenciaEstado(usuario.fecha_vencimiento)}
                    </td>
                    <td>
                      <button onClick={() => renovar(usuario, 30)}>
                        +30
                      </button>

                      {' '}

                      <button onClick={() => renovar(usuario, 90)}>
                        +90
                      </button>

                      {' '}

                      <button onClick={() => renovar(usuario, 180)}>
                        +180
                      </button>

                      {' '}

                      <button onClick={() => renovar(usuario, 365)}>
                        +365
                      </button>
                    </td>
                    <td>
                      <button onClick={() => fechaPersonalizada(usuario)}>
                        Fecha
                      </button>

                      {' '}

                      <button
                        className="secondary"
                        onClick={() => cambiarEstado(usuario)}
                      >
                        {usuario.estado === 'activo'
                          ? 'Suspender'
                          : 'Activar'}
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