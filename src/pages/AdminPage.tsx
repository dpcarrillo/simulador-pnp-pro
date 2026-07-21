import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

import AdminDashboardPage from './AdminDashboardPage'
import UserManagementPage from './UserManagementPage'
import QuestionManagementPage from './QuestionManagementPage'
import LicenseManagementPage from './LicenseManagementPage'
import ImportExcelPage from './ImportExcelPage'
import AuditPage from './AuditPage'

export default function AdminPage() {
  const { usuario, logout } = useAuth()
  const [page, setPage] = useState('inicio')

  if (page === 'dashboard') {
    return <AdminDashboardPage regresar={() => setPage('inicio')} />
  }

  if (page === 'usuarios') {
    return <UserManagementPage regresar={() => setPage('inicio')} />
  }

  if (page === 'preguntas') {
    return <QuestionManagementPage regresar={() => setPage('inicio')} />
  }

  if (page === 'licencias') {
    return <LicenseManagementPage regresar={() => setPage('inicio')} />
  }

  if (page === 'importar') {
    return <ImportExcelPage regresar={() => setPage('inicio')} />
  }

  if (page === 'auditoria') {
    return <AuditPage regresar={() => setPage('inicio')} />
  }

  return (
    <div className="exam-page">
      <div className="question-card">
        <h1>Panel Administrador</h1>

        <br />

        <p>
          Bienvenido: <strong>{usuario?.nombre}</strong>
        </p>

        <p>
          Rol: <strong>{usuario?.rol}</strong>
        </p>

        <br />

        <div className="admin-menu-grid">
          <button onClick={() => setPage('dashboard')}>
            Dashboard Administrativo
          </button>

          <button onClick={() => setPage('usuarios')}>
            Gestión de Usuarios
          </button>

          <button onClick={() => setPage('preguntas')}>
            Gestión de Preguntas
          </button>

          <button onClick={() => setPage('licencias')}>
            Gestión de Licencias
          </button>

          <button onClick={() => setPage('importar')}>
            Importar Preguntas
          </button>

          <button onClick={() => setPage('auditoria')}>
            Auditoría
          </button>

          <button onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}