import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type PreguntaFallada = {
  id: number
  contador: number
  errores: number
  aciertos_practica: number
  pregunta: {
    id: number
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

export default function PracticeWrongAnswersPage({ regresar }: Props) {
  const { usuario } = useAuth()

  const [falladas, setFalladas] = useState<PreguntaFallada[]>([])
  const [respuestas, setRespuestas] = useState<Record<number, string>>({})
  const [resultado, setResultado] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarFalladas()
  }, [usuario])

  async function cargarFalladas() {
    if (!usuario) return

    setLoading(true)

    const { data, error } = await supabase
      .from('falladas')
      .select(`
        id,
        contador,
        errores,
        aciertos_practica,
        pregunta:pregunta_id (
          id,
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
      .eq('usuario_id', usuario.id)
      .order('contador', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setFalladas((data || []) as unknown as PreguntaFallada[])
    setLoading(false)
  }

  function seleccionarRespuesta(preguntaId: number, letra: string) {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: letra,
    }))
  }

  async function verificarRespuesta(item: PreguntaFallada) {
    const marcada = respuestas[item.pregunta.id]

    if (!marcada) {
      alert('Seleccione una respuesta')
      return
    }

    const esCorrecta = marcada === item.pregunta.respuesta

    setResultado(prev => ({
      ...prev,
      [item.id]: esCorrecta,
    }))

    if (esCorrecta) {
      const nuevoContador = item.contador - 1

      if (nuevoContador <= 0) {
        const { error } = await supabase
          .from('falladas')
          .delete()
          .eq('id', item.id)

        if (error) {
          console.error(error)
          alert('Error al eliminar pregunta dominada')
          return
        }

        alert('Pregunta dominada. Se eliminó de falladas.')
      } else {
        const { error } = await supabase
          .from('falladas')
          .update({
            contador: nuevoContador,
            aciertos_practica: item.aciertos_practica + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id)

        if (error) {
          console.error(error)
          alert('Error al actualizar contador')
          return
        }

        alert(`Correcto. Dominio restante: ${nuevoContador}`)
      }
    } else {
      const { error } = await supabase
        .from('falladas')
        .update({
          contador: 3,
          errores: item.errores + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (error) {
        console.error(error)
        alert('Error al actualizar error')
        return
      }

      alert('Incorrecto. La pregunta vuelve a contador 3.')
    }

    setRespuestas(prev => ({
      ...prev,
      [item.pregunta.id]: '',
    }))

    cargarFalladas()
  }

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Practicar Preguntas Falladas</h1>

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

        {loading && <p>Cargando preguntas falladas...</p>}

        {!loading && falladas.length === 0 && (
          <p>No tienes preguntas falladas pendientes.</p>
        )}

        {!loading &&
          falladas.map((item, index) => {
            const opciones = [
              ['A', item.pregunta.alternativa_a],
              ['B', item.pregunta.alternativa_b],
              ['C', item.pregunta.alternativa_c],
              ['D', item.pregunta.alternativa_d],
              ['E', item.pregunta.alternativa_e],
            ]

            return (
              <div
                key={item.id}
                style={{
                  marginBottom: '30px',
                  paddingBottom: '20px',
                  borderBottom: '1px solid #334155',
                }}
              >
                <h3>
                  #{index + 1} - {item.pregunta.tema}
                </h3>

                <br />

                <p>{item.pregunta.pregunta}</p>

                <br />

                <p>
                  Errores acumulados: <strong>{item.errores}</strong>
                </p>

                <p>
                  Dominio restante:{' '}
                  <strong>{item.contador}</strong>
                </p>

                <br />

                <div className="options">
                  {opciones.map(([letra, texto]) => (
                    <button
                      key={letra}
                      className={
                        respuestas[item.pregunta.id] === letra
                          ? 'option selected'
                          : 'option'
                      }
                      onClick={() =>
                        seleccionarRespuesta(item.pregunta.id, letra)
                      }
                    >
                      <span>{letra}</span>
                      {texto}
                    </button>
                  ))}
                </div>

                <br />

                <button onClick={() => verificarRespuesta(item)}>
                  Verificar respuesta
                </button>

                <br />
                <br />

                {resultado[item.id] === true && (
                  <p style={{ color: '#22c55e' }}>
                    Correcto. Respuesta: {item.pregunta.respuesta}
                  </p>
                )}

                {resultado[item.id] === false && (
                  <p style={{ color: '#ef4444' }}>
                    Incorrecto. Respuesta correcta:{' '}
                    {item.pregunta.respuesta}
                  </p>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}