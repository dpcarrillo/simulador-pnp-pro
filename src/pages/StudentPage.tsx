import { useState } from 'react'

import ExamPage from './ExamPage'
import HistoryPage from './HistoryPage'
import DashboardPage from './DashboardPage'
import RankingPage from './RankingPage'
import WrongAnswersPage from './WrongAnswersPage'
import StudyByTopicPage from './StudyByTopicPage'
import ProgressByTopicPage from './ProgressByTopicPage'
import PracticeWrongAnswersPage from './PracticeWrongAnswersPage'

import { useAuth } from '../contexts/AuthContext'

export default function StudentPage() {
  const [page, setPage] = useState('inicio')
  const { usuario, logout } = useAuth()

  // Panel profesional con tarjetas
  if (page === 'inicio') {
    return (
      <div className="exam-page">
        <div className="question-card">
          <h1>Panel de Estudiante</h1>
          <br />
          <p>Bienvenido: <strong>{usuario?.nombre}</strong></p>
          <p>Licencia hasta: <strong>{usuario?.fecha_vencimiento}</strong></p>
          <br />

          <div className="dashboard-cards">
            <button onClick={() => setPage('simulacro')}>Simulacro General</button>
            <button onClick={() => setPage('temas')}>Estudiar por Temas</button>
            <button onClick={() => setPage('practicarFalladas')}>Practicar Preguntas Falladas</button>
            <button onClick={() => setPage('progreso')}>Progreso por Tema</button>
            <button onClick={() => setPage('historial')}>Historial</button>
            <button onClick={() => setPage('dashboard')}>Dashboard</button>
            <button onClick={() => setPage('ranking')}>Ranking</button>
            <button onClick={logout}>Cerrar sesión</button>
          </div>
        </div>
      </div>
    )
  }

  if (page === 'simulacro') return <ExamPage regresar={() => setPage('inicio')} />
  if (page === 'temas') return <StudyByTopicPage regresar={() => setPage('inicio')} />
  if (page === 'errores') return <WrongAnswersPage regresar={() => setPage('inicio')} />
  if (page === 'practicarFalladas') return <PracticeWrongAnswersPage regresar={() => setPage('inicio')} />
  if (page === 'progreso') return <ProgressByTopicPage regresar={() => setPage('inicio')} />
  if (page === 'historial') return <HistoryPage regresar={() => setPage('inicio')} />
  if (page === 'dashboard') return <DashboardPage regresar={() => setPage('inicio')} />
  if (page === 'ranking') return <RankingPage regresar={() => setPage('inicio')} />

  return <div>Página no encontrada</div>
}