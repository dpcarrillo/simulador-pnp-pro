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

type Simulacro = {
  id: number
  nombre_alumno: string
  porcentaje: number
  correctas: number
  incorrectas: number
  tipo: string
}

type TemaFallado = {
  tema: string
  errores: number
}

type Props = {
  regresar?: () => void
}

export default function AdminDashboardPage({ regresar }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [simulacros, setSimulacros] = useState<Simulacro[]>([])
  const [temasFallados, setTemasFallados] = useState<TemaFallado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDashboard()
  }, [])

  async function cargarDashboard() {
    setLoading(true)

    const { data: usuariosData } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, rol, estado, fecha_vencimiento')

    const { data: simulacrosData } = await supabase
      .from('simulacros')
      .select('id, nombre_alumno, porcentaje, correctas, incorrectas, tipo')
      .order('porcentaje', { ascending: false })

    const { data: erroresData } = await supabase
      .from('respuestas_simulacro')
      .select(`
        es_correcta,
        pregunta:pregunta_id (
          tema
        )
      `)
      .eq('es_correcta', false)

    setUsuarios(usuariosData || [])
    setSimulacros(simulacrosData || [])

    const conteoTemas: Record<string, number> = {}

    erroresData?.forEach((item: any) => {
      const tema = item.pregunta?.tema || 'SIN TEMA'
      conteoTemas[tema] = (conteoTemas[tema] || 0) + 1
    })

    const temasOrdenados = Object.entries(conteoTemas)
      .map(([tema, errores]) => ({
        tema,
        errores,
      }))
      .sort((a, b) => b.errores - a.errores)
      .slice(0, 10)

    setTemasFallados(temasOrdenados)
    setLoading(false)
  }

  function licenciaVencida(fecha: string) {
    return new Date(fecha) < new Date()
  }

  const totalUsuarios = usuarios.length
  const totalAlumnos = usuarios.filter(u => u.rol === 'alumno').length
  const totalAdmins = usuarios.filter(u => u.rol === 'admin').length
  const usuariosActivos = usuarios.filter(u => u.estado === 'activo').length
  const usuariosInactivos = usuarios.filter(u => u.estado === 'inactivo').length
  const licenciasVencidas = usuarios.filter(u =>
    licenciaVencida(u.fecha_vencimiento)
  ).length

  const totalSimulacros = simulacros.length

  const promedioGeneral =
    simulacros.length > 0
      ? simulacros.reduce((acc, item) => acc + Number(item.porcentaje), 0) /
        simulacros.length
      : 0

  const topAlumnos = simulacros.slice(0, 10)

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Dashboard Administrativo</h1>

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

        {loading && <p>Cargando dashboard administrativo...</p>}

        {!loading && (
          <>
            <div className="admin-dashboard-grid">
              <div className="admin-stat-card">
                <p>Total usuarios</p>
                <h2>{totalUsuarios}</h2>
              </div>

              <div className="admin-stat-card">
                <p>Alumnos</p>
                <h2>{totalAlumnos}</h2>
              </div>

              <div className="admin-stat-card">
                <p>Administradores</p>
                <h2>{totalAdmins}</h2>
              </div>

              <div className="admin-stat-card">
                <p>Usuarios activos</p>
                <h2>{usuariosActivos}</h2>
              </div>

              <div className="admin-stat-card danger">
                <p>Usuarios inactivos</p>
                <h2>{usuariosInactivos}</h2>
              </div>

              <div className="admin-stat-card danger">
                <p>Licencias vencidas</p>
                <h2>{licenciasVencidas}</h2>
              </div>

              <div className="admin-stat-card">
                <p>Total simulacros</p>
                <h2>{totalSimulacros}</h2>
              </div>

              <div className="admin-stat-card">
                <p>Promedio general</p>
                <h2>{promedioGeneral.toFixed(2)}%</h2>
              </div>
            </div>

            <br />
            <br />

            <h3>Top 10 mejores resultados</h3>

            <br />

            {topAlumnos.length === 0 && (
              <p>No existen simulacros registrados.</p>
            )}

            {topAlumnos.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Alumno</th>
                    <th>Tipo</th>
                    <th>Porcentaje</th>
                    <th>Correctas</th>
                    <th>Incorrectas</th>
                  </tr>
                </thead>

                <tbody>
                  {topAlumnos.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.nombre_alumno}</td>
                      <td>{item.tipo}</td>
                      <td>{Number(item.porcentaje).toFixed(2)}%</td>
                      <td>{item.correctas}</td>
                      <td>{item.incorrectas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <br />
            <br />

            <h3>Top 10 temas más fallados</h3>

            <br />

            {temasFallados.length === 0 && (
              <p>No existen errores registrados.</p>
            )}

            {temasFallados.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tema</th>
                    <th>Errores</th>
                  </tr>
                </thead>

                <tbody>
                  {temasFallados.map((item, index) => (
                    <tr key={item.tema}>
                      <td>{index + 1}</td>
                      <td>{item.tema}</td>
                      <td>{item.errores}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  )
}