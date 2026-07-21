type Props = {
  correctas: number
  incorrectas: number
  porcentaje: number
  tiempoUsado: string
}

export default function ResultsPage({
  correctas,
  incorrectas,
  porcentaje,
  tiempoUsado,
}: Props) {
  function volverInicio() {
    window.location.reload()
  }

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Resultado del Simulacro</h1>

        <br />

        <h2>
          Porcentaje obtenido: {porcentaje.toFixed(2)}%
        </h2>

        <br />

        <p>
          <strong>Correctas:</strong> {correctas}
        </p>

        <p>
          <strong>Incorrectas:</strong> {incorrectas}
        </p>

        <p>
          <strong>Tiempo usado:</strong> {tiempoUsado}
        </p>

        <br />

        <h2>
          {porcentaje >= 70
            ? 'APROBADO'
            : 'DESAPROBADO'}
        </h2>

        <br />

        <button onClick={volverInicio}>
          Volver al inicio
        </button>
      </div>
    </div>
  )
}