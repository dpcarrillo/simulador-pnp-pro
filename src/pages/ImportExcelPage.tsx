import { useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'

type PreguntaExcel = {
  codigo: string
  tema: string
  pregunta: string
  alternativa_a: string
  alternativa_b: string
  alternativa_c: string
  alternativa_d: string
  alternativa_e: string
  respuesta: string
  ubicacion: string
}

type Props = {
  regresar?: () => void
}

export default function ImportExcelPage({ regresar }: Props) {
  const [preguntas, setPreguntas] = useState<PreguntaExcel[]>([])
  const [loading, setLoading] = useState(false)
  const [archivoNombre, setArchivoNombre] = useState('')

  function normalizarTexto(valor: any) {
    if (valor === undefined || valor === null) return ''
    return String(valor).trim()
  }

  function leerExcel(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    setArchivoNombre(file.name)

    const reader = new FileReader()

    reader.onload = e => {
      const data = e.target?.result

      const workbook = XLSX.read(data, {
        type: 'array',
      })

      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
      })

      const preguntasConvertidas: PreguntaExcel[] = rows.map(row => ({
        codigo: normalizarTexto(row.codigo || row.CODIGO || row.Código),
        tema: normalizarTexto(row.tema || row.TEMA),
        pregunta: normalizarTexto(row.pregunta || row.PREGUNTA),
        alternativa_a: normalizarTexto(
          row.alternativa_a || row.ALTERNATIVA_A || row.A
        ),
        alternativa_b: normalizarTexto(
          row.alternativa_b || row.ALTERNATIVA_B || row.B
        ),
        alternativa_c: normalizarTexto(
          row.alternativa_c || row.ALTERNATIVA_C || row.C
        ),
        alternativa_d: normalizarTexto(
          row.alternativa_d || row.ALTERNATIVA_D || row.D
        ),
        alternativa_e: normalizarTexto(
          row.alternativa_e || row.ALTERNATIVA_E || row.E
        ),
        respuesta: normalizarTexto(row.respuesta || row.RESPUESTA),
        ubicacion: normalizarTexto(
          row.ubicacion ||
            row.UBICACION ||
            row.base_legal ||
            row.BASE_LEGAL
        ),
      }))

      const validas = preguntasConvertidas.filter(
        item =>
          item.tema &&
          item.pregunta &&
          item.alternativa_a &&
          item.alternativa_b &&
          item.alternativa_c &&
          item.alternativa_d &&
          item.respuesta
      )

      setPreguntas(validas)
    }

    reader.readAsArrayBuffer(file)
  }

  async function importarPreguntas() {
    if (preguntas.length === 0) {
      alert('No hay preguntas para importar')
      return
    }

    const confirmar = window.confirm(
      `¿Deseas importar ${preguntas.length} preguntas?`
    )

    if (!confirmar) return

    setLoading(true)

    const lote = 500

    for (let i = 0; i < preguntas.length; i += lote) {
      const bloque = preguntas.slice(i, i + lote)

      const { error } = await supabase
        .from('preguntas')
        .insert(bloque)

      if (error) {
        console.error(error)
        alert('Error al importar preguntas')
        setLoading(false)
        return
      }
    }

    setLoading(false)
    alert('Preguntas importadas correctamente')

    setPreguntas([])
    setArchivoNombre('')
  }

  function limpiar() {
    setPreguntas([])
    setArchivoNombre('')
  }

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Importar Preguntas desde Excel</h1>

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
          Selecciona un archivo Excel con el formato correcto para cargar
          preguntas al banco.
        </p>

        <br />

        <h3>Columnas requeridas</h3>

        <br />

        <p>
          codigo, tema, pregunta, alternativa_a, alternativa_b,
          alternativa_c, alternativa_d, alternativa_e, respuesta, ubicacion
        </p>

        <br />

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={leerExcel}
        />

        <br />
        <br />

        {archivoNombre && (
          <p>
            Archivo seleccionado: <strong>{archivoNombre}</strong>
          </p>
        )}

        <br />

        {preguntas.length > 0 && (
          <>
            <h3>Vista previa</h3>

            <br />

            <p>
              Preguntas detectadas:{' '}
              <strong>{preguntas.length}</strong>
            </p>

            <br />

            <button onClick={importarPreguntas} disabled={loading}>
              {loading ? 'Importando...' : 'Importar preguntas'}
            </button>

            {' '}

            <button className="secondary" onClick={limpiar}>
              Limpiar
            </button>

            <br />
            <br />

            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Código</th>
                    <th>Tema</th>
                    <th>Pregunta</th>
                    <th>Respuesta</th>
                  </tr>
                </thead>

                <tbody>
                  {preguntas.slice(0, 20).map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.codigo}</td>
                      <td>{item.tema}</td>
                      <td>{item.pregunta}</td>
                      <td>{item.respuesta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <br />

            <p>
              Solo se muestran las primeras 20 preguntas como vista previa.
            </p>
          </>
        )}
      </div>
    </div>
  )
}