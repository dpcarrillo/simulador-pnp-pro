import { useState } from 'react'
import AppShell, { type NavItem } from '../components/AppShell'
import ExamPage from './ExamPage'
import HistoryPage from './HistoryPage'
import DashboardPage from './DashboardPage'
import WrongAnswersPage from './WrongAnswersPage'
import StudyByTopicPage from './StudyByTopicPage'
import ProgressByTopicPage from './ProgressByTopicPage'
import PracticeWrongAnswersPage from './PracticeWrongAnswersPage'
import { useAuth } from '../contexts/AuthContext'
const items: NavItem[] = [
  { id: 'inicio', label: 'Inicio', icon: '⌂', description: 'Tu espacio de preparación' },
  { id: 'simulacro', label: 'Simulacro general', icon: '▣', description: 'Evalúa tus conocimientos' },
  { id: 'temas', label: 'Estudiar por temas', icon: '▤', description: 'Aprende a tu ritmo' },
  { id: 'practicarFalladas', label: 'Practicar falladas', icon: '↻', description: 'Refuerza tus conocimientos' },
  { id: 'progreso', label: 'Progreso por tema', icon: '▥', description: 'Mide tu avance' },
  { id: 'historial', label: 'Historial', icon: '◷', description: 'Tus exámenes anteriores' },
  { id: 'dashboard', label: 'Mis estadísticas', icon: '◫', description: 'Tus indicadores' },
]
export default function StudentPage() {
  const [page, setPage] = useState('inicio')
  const { usuario, logout } = useAuth()
  const regresar = () => setPage('inicio')
  let content: React.ReactNode
  switch (page) {
    case 'simulacro': content = <ExamPage regresar={regresar} verHistorial={() => setPage('historial')} practicarErrores={() => setPage('practicarFalladas')} />; break
    case 'temas': content = <StudyByTopicPage regresar={regresar} />; break
    case 'errores': content = <WrongAnswersPage regresar={regresar} />; break
    case 'practicarFalladas': content = <PracticeWrongAnswersPage regresar={regresar} />; break
    case 'progreso': content = <ProgressByTopicPage regresar={regresar} />; break
    case 'historial': content = <HistoryPage regresar={regresar} />; break
    case 'dashboard': content = <DashboardPage regresar={regresar} />; break
    default: content = <div className="home-view"><div className="home-eyebrow">MI ESPACIO DE APRENDIZAJE <span className="live-dot" /> LICENCIA ACTIVA</div><h1>¡Hola, {usuario?.nombre || 'Estudiante'}!</h1><p className="home-subtitle">Cada pregunta es una oportunidad para acercarte a tu meta.</p><div className="hero-banner"><div><span className="hero-kicker">TU PREPARACIÓN EMPIEZA AQUÍ</span><h2>Tu próximo logro<br/>comienza hoy.</h2><p>Entrena con simulacros y revisa tus avances.</p><button onClick={() => setPage('simulacro')}>Comenzar simulacro <span aria-hidden="true">↗</span></button></div><div className="hero-emblem" aria-hidden="true">PNP<span>PRO</span></div></div><div className="license-strip"><span>◇</span><div><strong>Estado de tu licencia</strong><small>Vigencia: {usuario?.fecha_vencimiento || 'Consultar administración'}</small></div><span className="license-tag">ACTIVA</span></div><div className="section-heading"><h2>¿Qué deseas hacer hoy?</h2><span>Tu aprendizaje</span></div><div className="feature-grid">{items.filter(i => i.id !== 'inicio').map(i => <button className="feature-card" key={i.id} onClick={() => setPage(i.id)}><span className="feature-icon">{i.icon}</span><strong>{i.label}</strong><small>{i.description}</small><span className="feature-arrow">↗</span></button>)}</div></div>
  }
  return <AppShell role="alumno" userName={usuario?.nombre || 'Estudiante'} items={items} page={page} onNavigate={setPage} onLogout={logout}>{content}</AppShell>
}
