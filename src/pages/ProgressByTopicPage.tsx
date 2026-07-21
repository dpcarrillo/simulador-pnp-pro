import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type ProgresoTema = {
  tema: string
  respondidas: number
  correctas: number
  total: number
  porcentaje: number
}

type Props = {
  regresar?: () => void
}

export default function ProgressByTopicPage({ regresar }: Props) {
  const { usuario } = useAuth()

  const [progreso, setProgreso] = useState<ProgresoTema[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!usuario) return

    cargarProgreso()
  }, [usuario])

  async function cargarProgreso() {
    if (!usuario) return

    const usuarioId = usuario.id

    setLoading(true)

    try {
      const { data: temasData, error: temasError } = await supabase
        .from('preguntas')
        .select('tema')

      if (temasError) {
        console.error('Error al cargar temas:', temasError)
        return
      }

      const temasUnicos = Array.from(
        new Set(
          (temasData || [])
            .map(item => item.tema)
            .filter((tema): tema is string => Boolean(tema))
        )
      )

      const resultado: ProgresoTema[] = []

      for (const tema of temasUnicos) {
        const { data: preguntasTema, error: preguntasError } =
          await supabase
            .from('preguntas')
            .select('id')
            .eq('tema', tema)

        if (preguntasError) {
          console.error(
            `Error al cargar preguntas del tema ${tema}:`,
            preguntasError
          )
          continue
        }

        const idsPreguntas =
          preguntasTema?.map(pregunta => pregunta.id) || []

        if (idsPreguntas.length === 0) {
          continue
        }

        const { data: respuestasAlumno, error: respuestasError } =
          await supabase
            .from('respuestas_simulacro')
            .select(`
              es_correcta,
              simulacro:simulacro_id (
                usuario_id
              )
            `)
            .eq('simulacro.usuario_id', usuarioId)
            .in('pregunta_id', idsPreguntas)

        if (respuestasError) {
          console.error(
            `Error al cargar respuestas del tema ${tema}:`,
            respuestasError
          )
          continue
        }

        const respuestasValidas = (respuestasAlumno || []).filter(
          (respuesta: any) =>
            respuesta.simulacro?.usuario_id === usuarioId
        )

        const respondidas = respuestasValidas.length

        const correctas = respuestasValidas.filter(
          (respuesta: any) => respuesta.es_correcta
        ).length

        const total = idsPreguntas.length

        const porcentaje =
          respondidas > 0
            ? (correctas / respondidas) * 100
            : 0

        resultado.push({
          tema,
          respondidas,
          correctas,
          total,
          porcentaje,
        })
      }

      resultado.sort((a, b) =>
        a.tema.localeCompare(b.tema)
      )

      setProgreso(resultado)
    } catch (error) {
      console.error('Error inesperado al cargar el progreso:', error)
    } finally {
      setLoading(false)
    }
  }

  function obtenerColor(porcentaje: number) {
    if (porcentaje >= 80) return '#16a34a'
    if (porcentaje >= 60) return '#ca8a04'
    return '#dc2626'
  }

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Progreso por Tema</h1>

        <br />

        {regresar && (
          <>
            <button
              className="secondary"
              onClick={regresar}
            >
              Volver al Panel
            </button>

            <br />
            <br />
          </>
        )}

        {loading && (
          <p>Cargando progreso...</p>
        )}

        {!loading && progreso.length === 0 && (
          <p>No hay progreso registrado todavía.</p>
        )}

        {!loading &&
          progreso.map(item => (
            <div
              key={item.tema}
              className="topic-card"
              style={{ marginBottom: '20px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '10px',
                }}
              >
                <h3>{item.tema}</h3>

                <strong>
                  {item.porcentaje.toFixed(2)}%
                </strong>
              </div>

              <p>
                Respondidas: {item.respondidas} | Correctas:{' '}
                {item.correctas} | Banco total: {item.total}
              </p>

              <br />

              <div
                style={{
                  width: '100%',
                  height: '20px',
                  background: '#111c36',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid #334155',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(item.porcentaje, 100)}%`,
                    height: '100%',
                    background: obtenerColor(item.porcentaje),
                    borderRadius: '10px',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}