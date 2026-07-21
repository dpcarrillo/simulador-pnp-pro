import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Auditoria = {
  id: number
  nombre: string
  correo: string
  rol: string
  accion: string
  modulo: string
  descripcion: string
  created_at: string
}

type Props = {
  regresar?: () => void
}

export default function AuditPage({ regresar }: Props) {
  const [registros, setRegistros] = useState<Auditoria[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarAuditoria()
  }, [])

  async function cargarAuditoria() {
    setLoading(true)

    const { data, error } = await supabase
      .from('auditoria')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setRegistros(data || [])
    setLoading(false)
  }

  async function buscarAuditoria() {
    setLoading(true)

    let query = supabase
      .from('auditoria')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (busqueda.trim()) {
      query = query.or(
        `nombre.ilike.%${busqueda}%,correo.ilike.%${busqueda}%,accion.ilike.%${busqueda}%,modulo.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setRegistros(data || [])
    setLoading(false)
  }

  function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleString()
  }

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Auditoría del Sistema</h1>

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
          Registro de ingresos, modificaciones y acciones importantes del
          sistema.
        </p>

        <br />

        <input
          placeholder="Buscar por usuario, correo, acción, módulo o descripción"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />

        <br />
        <br />

        <button onClick={buscarAuditoria}>
          Buscar
        </button>

        {' '}

        <button className="secondary" onClick={cargarAuditoria}>
          Limpiar
        </button>

        <br />
        <br />

        {loading && <p>Cargando auditoría...</p>}

        {!loading && registros.length === 0 && (
          <p>No existen registros de auditoría.</p>
        )}

        {!loading && registros.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Acción</th>
                  <th>Módulo</th>
                  <th>Descripción</th>
                </tr>
              </thead>

              <tbody>
                {registros.map(item => (
                  <tr key={item.id}>
                    <td>{formatearFecha(item.created_at)}</td>
                    <td>{item.nombre}</td>
                    <td>{item.correo}</td>
                    <td>{item.rol}</td>
                    <td>{item.accion}</td>
                    <td>{item.modulo}</td>
                    <td>{item.descripcion}</td>
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