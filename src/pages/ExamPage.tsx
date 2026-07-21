import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ResultsPage from './ResultsPage'

type Pregunta = {
  id: number
  codigo: string
  tema: string
  pregunta: string
  alternativa_a: string
  alternativa_b: string
  alternativa_c: string
  alternativa_d: string
  alternativa_e: string
  respuesta: string
}

type Props = {
  tema?: string
  cantidad?: number
  regresar?: () => void
}

const EXAM_DURATION = 120 * 60

export default function ExamPage({
  tema,
  cantidad = 100,
  regresar,
}: Props) {
  const { usuario } = useAuth()

  const [progresoId, setProgresoId] = useState<number | null>(null)
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [actual, setActual] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<number, string>>({})
  const [marcadas, setMarcadas] = useState<number[]>([])
  const [secondsLeft, setSecondsLeft] = useState(EXAM_DURATION)

  const [finalizado, setFinalizado] = useState(false)
  const [correctas, setCorrectas] = useState(0)
  const [incorrectas, setIncorrectas] = useState(0)
  const [porcentaje, setPorcentaje] = useState(0)
  const [loading, setLoading] = useState(true)

  const tipoExamen = tema ? 'EXAMEN_TEMA' : 'SIMULACRO_GENERAL'
  const temaGuardado = tema || ''

  useEffect(() => {
    cargarExamen()
  }, [usuario, tema, cantidad])

  useEffect(() => {
    if (finalizado || loading) return

    if (secondsLeft <= 0) {
      finalizarExamen(false)
      return
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [secondsLeft, finalizado, loading])

  useEffect(() => {
    if (!progresoId || finalizado || loading) return

    const interval = setInterval(() => {
      guardarProgreso(respuestas, marcadas, actual, secondsLeft)
    }, 10000)

    return () => clearInterval(interval)
  }, [
    progresoId,
    respuestas,
    marcadas,
    actual,
    secondsLeft,
    finalizado,
    loading,
  ])

  async function cargarExamen() {
    if (!usuario) return

    setLoading(true)

    const { data: progresoExistente, error: progresoError } = await supabase
      .from('examenes_en_progreso')
      .select('*')
      .eq('usuario_id', usuario.id)
      .eq('tipo', tipoExamen)
      .eq('tema', temaGuardado)
      .eq('cantidad', cantidad)
      .maybeSingle()

    if (progresoError) {
      console.error(progresoError)
      setLoading(false)
      return
    }

    if (progresoExistente) {
      const ids: number[] = progresoExistente.preguntas_ids || []

      const { data: preguntasData, error: preguntasError } = await supabase
        .from('preguntas')
        .select('*')
        .in('id', ids)

      if (preguntasError) {
        console.error(preguntasError)
        setLoading(false)
        return
      }

      const ordenadas = ids
        .map(id => preguntasData?.find(p => p.id === id))
        .filter(Boolean) as Pregunta[]

      setProgresoId(progresoExistente.id)
      setPreguntas(ordenadas)
      setRespuestas(progresoExistente.respuestas || {})
      setMarcadas(progresoExistente.marcadas || [])
      setActual(progresoExistente.actual || 0)
      setSecondsLeft(progresoExistente.seconds_left || EXAM_DURATION)
      setLoading(false)
      return
    }

    let query = supabase.from('preguntas').select('*')

    if (tema) {
      query = query.eq('tema', tema)
    }

    const { data, error } = await query

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const seleccionadas = [...(data || [])]
      .sort(() => Math.random() - 0.5)
      .slice(0, cantidad)

    const preguntasIds = seleccionadas.map(p => p.id)

    const { data: nuevoProgreso, error: nuevoError } = await supabase
      .from('examenes_en_progreso')
      .insert({
        usuario_id: usuario.id,
        tipo: tipoExamen,
        tema: temaGuardado,
        cantidad,
        preguntas_ids: preguntasIds,
        respuestas: {},
        marcadas: [],
        actual: 0,
        seconds_left: EXAM_DURATION,
      })
      .select()
      .single()

    if (nuevoError) {
      console.error(nuevoError)
      setLoading(false)
      return
    }

    setProgresoId(nuevoProgreso.id)
    setPreguntas(seleccionadas)
    setRespuestas({})
    setMarcadas([])
    setActual(0)
    setSecondsLeft(EXAM_DURATION)
    setLoading(false)
  }

  async function guardarProgreso(
    respuestasActuales = respuestas,
    marcadasActuales = marcadas,
    actualActual = actual,
    tiempoActual = secondsLeft
  ) {
    if (!progresoId) return

    const { error } = await supabase
      .from('examenes_en_progreso')
      .update({
        respuestas: respuestasActuales,
        marcadas: marcadasActuales,
        actual: actualActual,
        seconds_left: tiempoActual,
        updated_at: new Date().toISOString(),
      })
      .eq('id', progresoId)

    if (error) {
      console.error(error)
    }
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

  const respondidas = Object.keys(respuestas).filter(
    key => respuestas[Number(key)]
  ).length

  const progreso = useMemo(() => {
    if (preguntas.length === 0) return 0
    return (respondidas / preguntas.length) * 100
  }, [respondidas, preguntas.length])

  function responder(preguntaId: number, letra: string) {
    const nuevasRespuestas = {
      ...respuestas,
      [preguntaId]: letra,
    }

    setRespuestas(nuevasRespuestas)
    guardarProgreso(nuevasRespuestas, marcadas, actual, secondsLeft)
  }

  function cambiarPregunta(index: number) {
    setActual(index)
    guardarProgreso(respuestas, marcadas, index, secondsLeft)
  }

  function marcarParaRevisar(preguntaId: number) {
    const nuevasMarcadas = marcadas.includes(preguntaId)
      ? marcadas.filter(id => id !== preguntaId)
      : [...marcadas, preguntaId]

    setMarcadas(nuevasMarcadas)
    guardarProgreso(respuestas, nuevasMarcadas, actual, secondsLeft)
  }

  async function guardarYSalir() {
    await guardarProgreso(respuestas, marcadas, actual, secondsLeft)

    if (regresar) regresar()
  }

  async function registrarFalladas() {
    if (!usuario) return

    const preguntasFalladas = preguntas.filter(pregunta => {
      const respuestaUsuario = respuestas[pregunta.id]
      return respuestaUsuario !== pregunta.respuesta
    })

    for (const pregunta of preguntasFalladas) {
      const { data: existente, error: buscarError } = await supabase
        .from('falladas')
        .select('id, errores')
        .eq('usuario_id', usuario.id)
        .eq('pregunta_id', pregunta.id)
        .maybeSingle()

      if (buscarError) {
        console.error(buscarError)
        continue
      }

      if (existente) {
        const erroresActuales = existente.errores || 0

        const { error } = await supabase
          .from('falladas')
          .update({
            contador: 3,
            errores: erroresActuales + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existente.id)

        if (error) console.error(error)
      } else {
        const { error } = await supabase.from('falladas').insert({
          usuario_id: usuario.id,
          pregunta_id: pregunta.id,
          contador: 3,
          errores: 1,
          aciertos_practica: 0,
        })

        if (error) console.error(error)
      }
    }
  }

  async function eliminarProgreso() {
    if (!progresoId) return

    const { error } = await supabase
      .from('examenes_en_progreso')
      .delete()
      .eq('id', progresoId)

    if (error) console.error(error)
  }

  async function finalizarExamen(preguntar = true) {
    if (finalizado) return

    if (preguntar) {
      const confirmar = window.confirm('¿Desea finalizar el examen?')
      if (!confirmar) return
    }

    if (!usuario) {
      alert('No se encontró usuario activo')
      return
    }

    let aciertos = 0

    preguntas.forEach(pregunta => {
      const respuestaUsuario = respuestas[pregunta.id]

      if (respuestaUsuario && respuestaUsuario === pregunta.respuesta) {
        aciertos++
      }
    })

    const errores = preguntas.length - aciertos
    const porcentajeFinal =
      preguntas.length > 0 ? (aciertos / preguntas.length) * 100 : 0

    setCorrectas(aciertos)
    setIncorrectas(errores)
    setPorcentaje(porcentajeFinal)

    try {
      const { data: simulacro, error: simulacroError } = await supabase
        .from('simulacros')
        .insert({
          usuario_id: usuario.id,
          tipo: tema ? `EXAMEN POR TEMA: ${tema}` : 'SIMULACRO GENERAL',
          nombre_alumno: usuario.nombre,
          puntaje: aciertos,
          total_preguntas: preguntas.length,
          correctas: aciertos,
          incorrectas: errores,
          porcentaje: porcentajeFinal,
          tiempo_usado: EXAM_DURATION - secondsLeft,
        })
        .select()
        .single()

      if (simulacroError) {
        console.error(simulacroError)
        alert('Error al guardar simulacro')
        return
      }

      const respuestasDetalle = preguntas.map(pregunta => ({
        simulacro_id: simulacro.id,
        pregunta_id: pregunta.id,
        respuesta_marcada: respuestas[pregunta.id] || null,
        es_correcta: respuestas[pregunta.id] === pregunta.respuesta,
      }))

      const { error: respuestasError } = await supabase
        .from('respuestas_simulacro')
        .insert(respuestasDetalle)

      if (respuestasError) {
        console.error(respuestasError)
      }

      await registrarFalladas()
      await eliminarProgreso()
    } catch (error) {
      console.error(error)
      alert('Error inesperado al finalizar examen')
      return
    }

    setFinalizado(true)
  }

  if (finalizado) {
    return (
      <ResultsPage
        correctas={correctas}
        incorrectas={incorrectas}
        porcentaje={porcentaje}
        tiempoUsado={formatTime(EXAM_DURATION - secondsLeft)}
      />
    )
  }

  if (loading) {
    return (
      <div className="exam-page">
        <div className="question-card">
          <h2>Cargando examen...</h2>
        </div>
      </div>
    )
  }

  const pregunta = preguntas[actual]

  if (!pregunta) {
    return (
      <div className="exam-page">
        <div className="question-card">
          <h2>No se encontraron preguntas.</h2>

          <br />

          {regresar && (
            <button className="secondary" onClick={regresar}>
              Volver al Panel
            </button>
          )}
        </div>
      </div>
    )
  }

  const opciones = [
    ['A', pregunta.alternativa_a],
    ['B', pregunta.alternativa_b],
    ['C', pregunta.alternativa_c],
    ['D', pregunta.alternativa_d],
    ['E', pregunta.alternativa_e],
  ]

  return (
    <div className="exam-page">
      <header className="exam-header">
        <div className="exam-header-top">
          <div>
            <h2>{tema ? 'Examen por Tema' : 'Simulador Ascenso PNP'}</h2>

            <p>
              {tema
                ? `${tema} | ${preguntas.length} preguntas`
                : '100 preguntas | 120 minutos'}
            </p>
          </div>

          <div className="exam-info">
            <div>⏱ {formatTime(secondsLeft)}</div>

            <div>
              Respondidas
              <br />
              {respondidas}/{preguntas.length}
            </div>

            <div>
              Marcadas
              <br />
              {marcadas.length}
            </div>
          </div>
        </div>

        <div className="progress-bar" style={{ width: `${progreso}%` }} />
      </header>

      <div className="exam-layout">
        <aside className="navigator">
          <h3>Navegador de preguntas</h3>

          <div className="legend">
            <span>
              <div className="dot active-dot"></div>
              Actual
            </span>

            <span>
              <div className="dot answered-dot"></div>
              Respondida
            </span>

            <span>
              <div className="dot marked-dot"></div>
              Marcada
            </span>
          </div>

          <div className="question-grid">
            {preguntas.map((p, index) => (
              <button
                key={p.id}
                className={
                  index === actual
                    ? 'nav-question active'
                    : marcadas.includes(p.id)
                    ? 'nav-question marked'
                    : respuestas[p.id]
                    ? 'nav-question answered'
                    : 'nav-question'
                }
                onClick={() => cambiarPregunta(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button className="finish-btn" onClick={() => finalizarExamen(true)}>
            Finalizar Examen
          </button>

          <br />
          <br />

          <button className="secondary" onClick={guardarYSalir}>
            Guardar y salir
          </button>

          <br />
          <br />

          {regresar && (
            <button className="secondary" onClick={regresar}>
              Volver al Panel
            </button>
          )}
        </aside>

        <main className="question-card">
          <div className="question-meta">
            <strong>
              Pregunta {actual + 1} de {preguntas.length}
            </strong>

            <div className="topic-badge">{pregunta.tema}</div>
          </div>

          <h1>{pregunta.pregunta}</h1>

          <div className="options">
            {opciones.map(([letra, texto]) => (
              <button
                key={letra}
                className={
                  respuestas[pregunta.id] === letra
                    ? 'option selected'
                    : 'option'
                }
                onClick={() => responder(pregunta.id, letra)}
              >
                <span>{letra}</span>
                {texto}
              </button>
            ))}
          </div>

          <div className="exam-actions">
            <button
              disabled={actual === 0}
              onClick={() => cambiarPregunta(actual - 1)}
            >
              ← Anterior
            </button>

            <button
              className={
                marcadas.includes(pregunta.id)
                  ? 'secondary marked-action'
                  : 'secondary'
              }
              onClick={() => marcarParaRevisar(pregunta.id)}
            >
              {marcadas.includes(pregunta.id)
                ? 'Marcada para revisar'
                : 'Marcar para revisar'}
            </button>

            <button
              disabled={actual === preguntas.length - 1}
              onClick={() => cambiarPregunta(actual + 1)}
            >
              Siguiente →
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}