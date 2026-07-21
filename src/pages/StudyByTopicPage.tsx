import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import TopicExamPage from './TopicExamPage'

type Tema = {
  tema: string
  total: number
}

type Props = {
  regresar?: () => void
}

export default function StudyByTopicPage({ regresar }: Props) {
  const [temas, setTemas] = useState<Tema[]>([])
  const [loading, setLoading] = useState(true)

  const [temaSeleccionado, setTemaSeleccionado] = useState<string | null>(null)
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(0)

  useEffect(() => {
    cargarTemas()
  }, [])

  async function cargarTemas() {
    setLoading(true)

    const { data, error } = await supabase
      .from('preguntas')
      .select('tema')

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const agrupados: Record<string, number> = {}

    data?.forEach(item => {
      const tema = item.tema || 'SIN TEMA'
      agrupados[tema] = (agrupados[tema] || 0) + 1
    })

    const resultado = Object.entries(agrupados)
      .map(([tema, total]) => ({
        tema,
        total,
      }))
      .sort((a, b) => b.total - a.total)

    setTemas(resultado)
    setLoading(false)
  }

  function iniciarTema(tema: string, cantidad: number) {
    setTemaSeleccionado(tema)
    setCantidadSeleccionada(cantidad)
  }

  if (temaSeleccionado) {
    return (
      <TopicExamPage
        tema={temaSeleccionado}
        cantidad={cantidadSeleccionada}
        regresar={regresar}
      />
    )
  }

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Estudio por Temas</h1>

        <br />

        <p>Seleccione un tema para estudiar.</p>

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

        {loading && <p>Cargando temas...</p>}

        {!loading && temas.length === 0 && (
          <p>No existen temas registrados.</p>
        )}

        {!loading &&
          temas.map(item => (
            <div className="topic-card" key={item.tema}>
              <h3>{item.tema}</h3>

              <p>Total preguntas: {item.total}</p>

              <br />

              <button
                onClick={() =>
                  iniciarTema(item.tema, Math.min(10, item.total))
                }
              >
                10 preguntas
              </button>

              {' '}

              <button
                onClick={() =>
                  iniciarTema(item.tema, Math.min(50, item.total))
                }
              >
                50 preguntas
              </button>

              {' '}

              <button
                onClick={() =>
                  iniciarTema(item.tema, Math.min(100, item.total))
                }
              >
                100 preguntas
              </button>
            </div>
          ))}
      </div>
    </div>
  )
}