import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Simulacro = {
  nombre_alumno: string
  porcentaje: number
  correctas: number
  incorrectas: number
}

type RankingItem = {
  nombre_alumno: string
  mejor_porcentaje: number
  correctas: number
  incorrectas: number
}

type Props = {
  regresar?: () => void
}

export default function RankingPage({ regresar }: Props) {
  const [ranking, setRanking] = useState<RankingItem[]>([])

  useEffect(() => {
    cargarRanking()
  }, [])

  async function cargarRanking() {
    const { data, error } = await supabase
      .from('simulacros')
      .select('nombre_alumno, porcentaje, correctas, incorrectas')

    if (error) {
      console.error(error)
      return
    }

    const mapa: Record<string, RankingItem> = {}

    ;(data || []).forEach((item: Simulacro) => {
      const nombre = item.nombre_alumno || 'Sin nombre'
      const porcentaje = Number(item.porcentaje)

      if (!mapa[nombre] || porcentaje > mapa[nombre].mejor_porcentaje) {
        mapa[nombre] = {
          nombre_alumno: nombre,
          mejor_porcentaje: porcentaje,
          correctas: item.correctas,
          incorrectas: item.incorrectas,
        }
      }
    })

    const resultado = Object.values(mapa)
      .sort((a, b) => b.mejor_porcentaje - a.mejor_porcentaje)
      .slice(0, 50)

    setRanking(resultado)
  }

  function obtenerMedalla(posicion: number) {
    if (posicion === 0) return '🥇'
    if (posicion === 1) return '🥈'
    if (posicion === 2) return '🥉'
    return '🏅'
  }

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Ranking General</h1>

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

        {ranking.length === 0 && (
          <p>No existen simulacros registrados.</p>
        )}

        {ranking.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Alumno</th>
                <th>Mejor %</th>
                <th>Correctas</th>
                <th>Incorrectas</th>
              </tr>
            </thead>

            <tbody>
              {ranking.map((item, index) => (
                <tr key={item.nombre_alumno}>
                  <td>{obtenerMedalla(index)}</td>
                  <td>{item.nombre_alumno}</td>
                  <td>{item.mejor_porcentaje.toFixed(2)}%</td>
                  <td>{item.correctas}</td>
                  <td>{item.incorrectas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}