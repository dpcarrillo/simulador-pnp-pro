import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type Simulacro = {
  id: number
  tipo: string
  correctas: number
  incorrectas: number
  porcentaje: number
  tiempo_usado: number
  fecha: string
}

type TemaStats = {
  tema: string
  total: number
  correctas: number
  porcentaje: number
}

type Props = {
  regresar?: () => void
}

export default function DashboardPage({ regresar }: Props) {
  const { usuario } = useAuth()

  const [simulacros, setSimulacros] = useState<Simulacro[]>([])
  const [estadisticas, setEstadisticas] = useState<TemaStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDashboard()
  }, [])

  async function cargarDashboard() {
    if (!usuario) return

    setLoading(true)

    const { data: simulacrosData, error: simulacrosError } = await supabase
      .from('simulacros')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('id', { ascending: false })

    if (simulacrosError) {
      console.error(simulacrosError)
      setLoading(false)
      return
    }

    setSimulacros(simulacrosData || [])

    const simulacroIds = (simulacrosData || []).map(item => item.id)

    if (simulacroIds.length === 0) {
      setEstadisticas([])
      setLoading(false)
      return
    }

    const { data: respuestasData, error: respuestasError } = await supabase
      .from('respuestas_simulacro')
      .select(`
        es_correcta,
        pregunta:pregunta_id (
          tema
        )
      `)
      .in('simulacro_id', simulacroIds)

    if (respuestasError) {
      console.error(respuestasError)
      setLoading(false)
      return
    }

    const temas: Record<string, { total: number; correctas: number }> = {}

    respuestasData?.forEach((item: any) => {
      const tema = item.pregunta?.tema || 'SIN TEMA'

      if (!temas[tema]) {
        temas[tema] = {
          total: 0,
          correctas: 0,
        }
      }

      temas[tema].total++

      if (item.es_correcta) {
        temas[tema].correctas++
      }
    })

    const resultado = Object.entries(temas)
      .map(([tema, valor]) => ({
        tema,
        total: valor.total,
        correctas: valor.correctas,
        porcentaje:
          valor.total > 0
            ? (valor.correctas / valor.total) * 100
            : 0,
      }))
      .sort((a, b) => b.porcentaje - a.porcentaje)

    setEstadisticas(resultado)
    setLoading(false)
  }

  function getColor(porcentaje: number) {
    if (porcentaje >= 80) return '#16a34a'
    if (porcentaje >= 60) return '#ca8a04'
    return '#dc2626'
  }

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    return `${String(h).padStart(2, '0')}:${String(m).padStart(
      2,
      '0'
    )}:${String(s).padStart(2, '0')}`
  }

  const totalSimulacros = simulacros.length

  const promedio =
    simulacros.length > 0
      ? simulacros.reduce(
          (acc, item) => acc + Number(item.porcentaje),
          0
        ) / simulacros.length
      : 0

  const mejorNota =
    simulacros.length > 0
      ? Math.max(...simulacros.map(item => Number(item.porcentaje)))
      : 0

  const ultimoSimulacro = simulacros[0]

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Dashboard de Rendimiento</h1>

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
          Alumno: <strong>{usuario?.nombre}</strong>
        </p>

        <br />

        {loading && <p>Cargando dashboard...</p>}

        {!loading && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '30px',
              }}
            >
              <div className="topic-card">
                <h3>Total simulacros</h3>
                <h1>{totalSimulacros}</h1>
              </div>

              <div className="topic-card">
                <h3>Promedio</h3>
                <h1>{promedio.toFixed(2)}%</h1>
              </div>

              <div className="topic-card">
                <h3>Mejor nota</h3>
                <h1>{mejorNota.toFixed(2)}%</h1>
              </div>

              <div className="topic-card">
                <h3>Último resultado</h3>
                <h1>
                  {ultimoSimulacro
                    ? `${Number(ultimoSimulacro.porcentaje).toFixed(2)}%`
                    : 'Sin datos'}
                </h1>
              </div>
            </div>

            {ultimoSimulacro && (
              <>
                <h3>Último simulacro</h3>

                <br />

                <table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Correctas</th>
                      <th>Incorrectas</th>
                      <th>Porcentaje</th>
                      <th>Tiempo</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>{ultimoSimulacro.tipo}</td>
                      <td>{ultimoSimulacro.correctas}</td>
                      <td>{ultimoSimulacro.incorrectas}</td>
                      <td>
                        {Number(ultimoSimulacro.porcentaje).toFixed(2)}%
                      </td>
                      <td>{formatTime(ultimoSimulacro.tiempo_usado)}</td>
                    </tr>
                  </tbody>
                </table>

                <br />
                <br />
              </>
            )}

            <h3>Rendimiento por Tema</h3>

            <br />

            {estadisticas.length === 0 && (
              <p>No hay estadísticas registradas todavía.</p>
            )}

            {estadisticas.map(item => (
              <div key={item.tema} style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <strong>{item.tema}</strong>

                  <strong>{item.porcentaje.toFixed(1)}%</strong>
                </div>

                <div
                  style={{
                    height: '12px',
                    background: '#1e293b',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${item.porcentaje}%`,
                      height: '100%',
                      background: getColor(item.porcentaje),
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: '5px',
                    fontSize: '13px',
                    color: '#94a3b8',
                  }}
                >
                  {item.correctas} / {item.total} correctas
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}