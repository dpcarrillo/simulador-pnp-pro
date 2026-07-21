import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
  ubicacion: string
}

type Props = {
  regresar?: () => void
}

const preguntaVacia: Omit<Pregunta, 'id'> = {
  codigo: '',
  tema: '',
  pregunta: '',
  alternativa_a: '',
  alternativa_b: '',
  alternativa_c: '',
  alternativa_d: '',
  alternativa_e: '',
  respuesta: '',
  ubicacion: '',
}

export default function QuestionManagementPage({ regresar }: Props) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<Omit<Pregunta, 'id'>>(preguntaVacia)
  const [editandoId, setEditandoId] = useState<number | null>(null)

  useEffect(() => {
    cargarPreguntas()
  }, [])

  async function cargarPreguntas() {
    setLoading(true)

    const { data, error } = await supabase
      .from('preguntas')
      .select('*')
      .order('id', { ascending: true })
      .limit(100)

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setPreguntas(data || [])
    setLoading(false)
  }

  async function buscarPreguntas() {
    setLoading(true)

    let query = supabase
      .from('preguntas')
      .select('*')
      .order('id', { ascending: true })
      .limit(100)

    if (busqueda.trim()) {
      query = query.or(
        `pregunta.ilike.%${busqueda}%,tema.ilike.%${busqueda}%,codigo.ilike.%${busqueda}%`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setPreguntas(data || [])
    setLoading(false)
  }

  function cambiarCampo(campo: keyof Omit<Pregunta, 'id'>, valor: string) {
    setForm(prev => ({
      ...prev,
      [campo]: valor,
    }))
  }

  function editarPregunta(pregunta: Pregunta) {
    setEditandoId(pregunta.id)

    setForm({
      codigo: pregunta.codigo || '',
      tema: pregunta.tema || '',
      pregunta: pregunta.pregunta || '',
      alternativa_a: pregunta.alternativa_a || '',
      alternativa_b: pregunta.alternativa_b || '',
      alternativa_c: pregunta.alternativa_c || '',
      alternativa_d: pregunta.alternativa_d || '',
      alternativa_e: pregunta.alternativa_e || '',
      respuesta: pregunta.respuesta || '',
      ubicacion: pregunta.ubicacion || '',
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setForm(preguntaVacia)
  }

  async function guardarPregunta() {
    if (!form.tema || !form.pregunta || !form.respuesta) {
      alert('Tema, pregunta y respuesta son obligatorios')
      return
    }

    if (editandoId) {
      const { error } = await supabase
        .from('preguntas')
        .update(form)
        .eq('id', editandoId)

      if (error) {
        console.error(error)
        alert('Error al actualizar pregunta')
        return
      }

      alert('Pregunta actualizada')
    } else {
      const { error } = await supabase
        .from('preguntas')
        .insert(form)

      if (error) {
        console.error(error)
        alert('Error al crear pregunta')
        return
      }

      alert('Pregunta creada')
    }

    cancelarEdicion()
    buscarPreguntas()
  }

  async function eliminarPregunta(id: number) {
    const confirmar = window.confirm(
      '¿Seguro que deseas eliminar esta pregunta?'
    )

    if (!confirmar) return

    const { error } = await supabase
      .from('preguntas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Error al eliminar pregunta')
      return
    }

    buscarPreguntas()
  }

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Gestión de Preguntas</h1>

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

        <h3>{editandoId ? 'Editar pregunta' : 'Crear nueva pregunta'}</h3>

        <br />

        <input
          placeholder="Código"
          value={form.codigo}
          onChange={e => cambiarCampo('codigo', e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Tema"
          value={form.tema}
          onChange={e => cambiarCampo('tema', e.target.value)}
        />

        <br /><br />

        <textarea
          placeholder="Pregunta"
          value={form.pregunta}
          onChange={e => cambiarCampo('pregunta', e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Alternativa A"
          value={form.alternativa_a}
          onChange={e => cambiarCampo('alternativa_a', e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Alternativa B"
          value={form.alternativa_b}
          onChange={e => cambiarCampo('alternativa_b', e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Alternativa C"
          value={form.alternativa_c}
          onChange={e => cambiarCampo('alternativa_c', e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Alternativa D"
          value={form.alternativa_d}
          onChange={e => cambiarCampo('alternativa_d', e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Alternativa E"
          value={form.alternativa_e}
          onChange={e => cambiarCampo('alternativa_e', e.target.value)}
        />

        <br /><br />

        <select
          value={form.respuesta}
          onChange={e => cambiarCampo('respuesta', e.target.value)}
        >
          <option value="">Seleccione respuesta correcta</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
        </select>

        <br /><br />

        <textarea
          placeholder="Ubicación legal"
          value={form.ubicacion}
          onChange={e => cambiarCampo('ubicacion', e.target.value)}
        />

        <br /><br />

        <button onClick={guardarPregunta}>
          {editandoId ? 'Actualizar pregunta' : 'Crear pregunta'}
        </button>

        {' '}

        {editandoId && (
          <button className="secondary" onClick={cancelarEdicion}>
            Cancelar
          </button>
        )}

        <hr style={{ margin: '30px 0' }} />

        <h3>Buscar preguntas</h3>

        <br />

        <input
          placeholder="Buscar por pregunta, tema o código"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />

        <br /><br />

        <button onClick={buscarPreguntas}>
          Buscar
        </button>

        {' '}

        <button className="secondary" onClick={cargarPreguntas}>
          Limpiar
        </button>

        <br /><br />

        {loading && <p>Cargando preguntas...</p>}

        {!loading && (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Tema</th>
                  <th>Pregunta</th>
                  <th>Respuesta</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {preguntas.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.codigo}</td>
                    <td>{item.tema}</td>
                    <td>{item.pregunta}</td>
                    <td>{item.respuesta}</td>
                    <td>
                      <button onClick={() => editarPregunta(item)}>
                        Editar
                      </button>

                      {' '}

                      <button onClick={() => eliminarPregunta(item.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}