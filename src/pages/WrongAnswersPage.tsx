import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type ErrorPregunta = {
  id: number
  respuesta_marcada: string | null
  pregunta: {
    pregunta: string
    tema: string
    alternativa_a: string
    alternativa_b: string
    alternativa_c: string
    alternativa_d: string
    alternativa_e: string
    respuesta: string
  }
}

type Props = {
  regresar?: () => void
}

export default function WrongAnswersPage({ regresar }: Props) {
  const { usuario } = useAuth()
  const [errores, setErrores] = useState<ErrorPregunta[]>([])

  useEffect(() => {
    cargarErrores()
  }, [])

  async function cargarErrores() {
    if (!usuario) return

    const { data, error } = await supabase
      .from('respuestas_simulacro')
      .select(`
        id,
        respuesta_marcada,
        simulacro:simulacro_id (
          usuario_id
        ),
        pregunta:pregunta_id (
          pregunta,
          tema,
          alternativa_a,
          alternativa_b,
          alternativa_c,
          alternativa_d,
          alternativa_e,
          respuesta
        )
      `)
      .eq('es_correcta', false)
      .eq('simulacro.usuario_id', usuario.id)
      .order('id', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setErrores((data || []) as unknown as ErrorPregunta[])
  }

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Banco de Preguntas Falladas</h1>

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

        {errores.length === 0 && <p>No existen errores registrados.</p>}

        {errores.map((item, index) => (
          <div
            key={item.id}
            style={{
              marginBottom: '30px',
              paddingBottom: '20px',
              borderBottom: '1px solid #334155',
            }}
          >
            <h3>#{index + 1}</h3>

            <br />

            <strong>Tema:</strong>
            <p>{item.pregunta.tema}</p>

            <br />

            <strong>Pregunta:</strong>
            <p>{item.pregunta.pregunta}</p>

            <br />

            <div>
              <p>A) {item.pregunta.alternativa_a}</p>
              <p>B) {item.pregunta.alternativa_b}</p>
              <p>C) {item.pregunta.alternativa_c}</p>
              <p>D) {item.pregunta.alternativa_d}</p>
              <p>E) {item.pregunta.alternativa_e}</p>
            </div>

            <br />

            <p>❌ Tu respuesta: {item.respuesta_marcada || 'Sin responder'}</p>
            <p>✅ Correcta: {item.pregunta.respuesta}</p>
          </div>
        ))}
      </div>
    </div>
  )
}