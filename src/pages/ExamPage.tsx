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

  const sinContestar = preguntas.length - respondidas
  const respuestasRegistradas = preguntas
    .map((p, index) => respuestas[p.id] ? `${index + 1}${respuestas[p.id]}` : null)
    .filter((valor): valor is string => valor !== null)

  return (
    <div className="exam-page exam-2027">
      <header className="exam-institutional-header">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <p>SIMULADOR PARA EL PROCESO DE ASCENSO DE SUBOFICIALES DE LA POLICÍA NACIONAL DEL PERÚ - PROMOCIÓN 2027</p>
      </header>

      <div className="exam-2027-toolbar">
        <strong>Pregunta {actual + 1} de {preguntas.length}</strong>
        <span className="exam-2027-topic" title={pregunta.tema}>{pregunta.tema}</span>
        <span className="exam-2027-clock" aria-label="Tiempo restante">◷ {formatTime(secondsLeft)}</span>
        <button type="button" className="exam-2027-finish" onClick={() => finalizarExamen(true)}>Finalizar examen</button>
      </div>

      <div className="exam-layout">
        <aside className="navigator" aria-label="Navegador de preguntas">
          <div className="question-grid">
            {preguntas.map((p, index) => (
              <button
                type="button"
                key={p.id}
                title={`Pregunta ${index + 1}${respuestas[p.id] ? ' · contestada' : ' · sin contestar'}${marcadas.includes(p.id) ? ' · marcada' : ''}`}
                aria-label={`Pregunta ${index + 1}`}
                aria-current={index === actual ? 'step' : undefined}
                className={[
                  'nav-question',
                  index === actual ? 'active' : '',
                  respuestas[p.id] ? 'answered' : '',
                  marcadas.includes(p.id) ? 'marked' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => cambiarPregunta(index)}
              >
                {String(index + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
        </aside>

        <div className="exam-2027-body">
          <main className="question-card">
            <h2 className="exam-2027-question">{actual + 1}. {pregunta.pregunta}</h2>
            <div className="options">
              {opciones.map(([letra, texto]) => (
                <button
                  type="button"
                  key={letra}
                  aria-pressed={respuestas[pregunta.id] === letra}
                  className={respuestas[pregunta.id] === letra ? 'option selected' : 'option'}
                  onClick={() => responder(pregunta.id, letra)}
                >
                  <span>{letra}</span><span className="exam-2027-answer-text">{texto}</span>
                </button>
              ))}
            </div>
            <div className="exam-2027-actions">
              <button type="button" className="exam-2027-clear" disabled={!respuestas[pregunta.id]} onClick={() => {
                const nuevasRespuestas = { ...respuestas }
                delete nuevasRespuestas[pregunta.id]
                setRespuestas(nuevasRespuestas)
                guardarProgreso(nuevasRespuestas, marcadas, actual, secondsLeft)
              }}>Borrar respuesta</button>
              <button type="button" className={marcadas.includes(pregunta.id) ? 'exam-2027-mark is-marked' : 'exam-2027-mark'} onClick={() => marcarParaRevisar(pregunta.id)}>
                {marcadas.includes(pregunta.id) ? '☑ Marcada para revisar' : '□ Marcar para revisar'}
              </button>
              <button type="button" className="exam-2027-save-inline" onClick={guardarYSalir}>Guardar y salir</button>
              <div className="exam-2027-spacer" />
              <button type="button" className="exam-2027-prev" disabled={actual === 0} onClick={() => cambiarPregunta(actual - 1)}>← Anterior</button>
              <button type="button" className="exam-2027-next" disabled={actual === preguntas.length - 1} onClick={() => cambiarPregunta(actual + 1)}>Siguiente →</button>
            </div>
          </main>
          <section className="exam-2027-summary" aria-label="Estado del examen">
            <h3>Estado del examen</h3>
            <div className="exam-2027-stats">
              <div><strong className="stat-done">{respondidas}</strong><span>Preguntas contestadas</span></div>
              <div><strong>{sinContestar}</strong><span>Preguntas sin contestar</span></div>
              <div><strong className="stat-marked">{marcadas.length}</strong><span>Preguntas marcadas</span></div>
              <div className="exam-2027-progress"><strong>{Math.round(progreso)}%</strong><span>Progreso del examen</span><div className="exam-2027-track"><div style={{ width: `${progreso}%` }} /></div></div>
            </div>
            <p className="exam-2027-registered"><strong>Respuestas registradas:</strong> {respuestasRegistradas.length ? respuestasRegistradas.join(', ') : 'Ninguna todavía'}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
