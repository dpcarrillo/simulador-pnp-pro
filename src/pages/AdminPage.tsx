import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AppShell, { type NavItem } from '../components/AppShell'
import AdminDashboardPage from './AdminDashboardPage'
import UserManagementPage from './UserManagementPage'
import QuestionManagementPage from './QuestionManagementPage'
import LicenseManagementPage from './LicenseManagementPage'
import ImportExcelPage from './ImportExcelPage'
import AuditPage from './AuditPage'

const items: NavItem[] = [
  { id: 'inicio', label: 'Inicio', icon: '⌂', description: 'Vista general del sistema' },
  { id: 'dashboard', label: 'Estadísticas', icon: '▥', description: 'Indicadores y actividad' },
  { id: 'usuarios', label: 'Usuarios', icon: '♙', description: 'Cuentas y perfiles' },
  { id: 'preguntas', label: 'Banco de preguntas', icon: '▤', description: 'Gestionar cuestionarios' },
  { id: 'licencias', label: 'Licencias', icon: '◇', description: 'Accesos y vencimientos' },
  { id: 'importar', label: 'Importar Excel', icon: '⇧', description: 'Carga masiva de preguntas' },
  { id: 'auditoria', label: 'Auditoría', icon: '◎', description: 'Registro de actividades' },
]

export default function AdminPage() {
  const [page, setPage] = useState('inicio')
  const { usuario, logout } = useAuth()
  const regresar = () => setPage('inicio')
  let content: React.ReactNode
  switch (page) {
    case 'dashboard': content = <AdminDashboardPage regresar={regresar} />; break
    case 'usuarios': content = <UserManagementPage regresar={regresar} />; break
    case 'preguntas': content = <QuestionManagementPage regresar={regresar} />; break
    case 'licencias': content = <LicenseManagementPage regresar={regresar} />; break
    case 'importar': content = <ImportExcelPage regresar={regresar} />; break
    case 'auditoria': content = <AuditPage regresar={regresar} />; break
    default:
      content = <div className="home-view">
        <div className="home-eyebrow">CENTRO DE CONTROL <span className="live-dot" /> SISTEMA ACTIVO</div>
        <h1>Bienvenido, {usuario?.nombre || 'Administrador'}</h1>
        <p className="home-subtitle">Administra tu plataforma de preparación PNP desde un solo lugar.</p>
        <div className="hero-banner"><div><span className="hero-kicker">SIMULADOR PNP PRO</span><h2>Gestiona el aprendizaje.<br/>Impulsa los resultados.</h2><p>Usuarios, preguntas, licencias y seguimiento en una plataforma.</p><button onClick={() => setPage('dashboard')}>Ver estadísticas <span aria-hidden="true">↗</span></button></div><div className="hero-emblem" aria-hidden="true">PNP<span>PRO</span></div></div>
        <div className="section-heading"><h2>Accesos rápidos</h2><span>Administración</span></div>
        <div className="feature-grid">{items.filter(i => i.id !== 'inicio').map(i => <button className="feature-card" key={i.id} onClick={() => setPage(i.id)}><span className="feature-icon">{i.icon}</span><strong>{i.label}</strong><small>{i.description}</small><span className="feature-arrow">↗</span></button>)}</div>
      </div>
  }
  return <AppShell role="admin" userName={usuario?.nombre || 'Administrador'} items={items} page={page} onNavigate={setPage} onLogout={logout}>{content}</AppShell>
}
