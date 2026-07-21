import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type Simulacro = {
  id: number
  tipo: string
  fecha: string
  correctas: number
  incorrectas: number
  porcentaje: number
  tiempo_usado: number
}

type Props = {
  regresar?: () => void
}

export default function HistoryPage({ regresar }: Props) {
  const { usuario } = useAuth()
  const [simulacros, setSimulacros] = useState<Simulacro[]>([])

  useEffect(() => {
    cargarHistorial()
  }, [])

  async function cargarHistorial() {
    if (!usuario) return

    const { data, error } = await supabase
      .from('simulacros')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('id', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setSimulacros(data || [])
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

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Historial de Simulacros</h1>

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

        {simulacros.length === 0 && <p>No tienes simulacros registrados.</p>}

        {simulacros.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Correctas</th>
                <th>Incorrectas</th>
                <th>Porcentaje</th>
                <th>Tiempo</th>
              </tr>
            </thead>

            <tbody>
              {simulacros.map(simulacro => (
                <tr key={simulacro.id}>
                  <td>{simulacro.id}</td>
                  <td>{simulacro.tipo}</td>
                  <td>{simulacro.correctas}</td>
                  <td>{simulacro.incorrectas}</td>
                  <td>{Number(simulacro.porcentaje).toFixed(2)}%</td>
                  <td>{formatTime(simulacro.tiempo_usado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}