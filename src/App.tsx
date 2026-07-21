import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import StudentPage from './pages/StudentPage'

import {
  AuthProvider,
  useAuth,
} from './contexts/AuthContext'

function Router() {
  const { usuario, loading } = useAuth()

  if (loading) {
    return (
      <div className="exam-page">
        <div className="question-card">
          <h2>Cargando sesión...</h2>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return <LoginPage />
  }

  if (usuario.rol === 'admin') {
    return <AdminPage />
  }

  return <StudentPage />
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}

export default App