import { useState, type ReactNode } from 'react'
export type NavItem = { id: string; label: string; icon: string; description?: string }
type Props = { role: 'admin' | 'alumno'; userName: string; items: NavItem[]; page: string; onNavigate: (page: string) => void; onLogout: () => void | Promise<void>; children: ReactNode }
export default function AppShell({ role, userName, items, page, onNavigate, onLogout, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const active = items.find(i => i.id === page)
  const navigate = (id: string) => { onNavigate(id); setMenuOpen(false) }
  return <div className="app-shell">
    {menuOpen && <button className="mobile-backdrop" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />}
    <aside className={`app-sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="brand" onClick={() => navigate('inicio')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') navigate('inicio') }}><span className="brand-symbol">✦</span><div><strong>SIMULADOR <em>PNP</em></strong><small>PRO · PLATAFORMA EDUCATIVA</small></div></div>
      <div className="nav-label">MENÚ PRINCIPAL</div>
      <nav className="sidebar-nav" aria-label="Navegación principal">{items.map(item => <button key={item.id} className={`sidebar-link ${page === item.id ? 'current' : ''}`} onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span>{page === item.id && <span className="nav-active-indicator" />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-help"><span>✧</span><strong>Preparación sin límites</strong><small>Tu camino al siguiente nivel.</small></div><button className="sidebar-logout" onClick={() => void onLogout()}><span>↪</span> Cerrar sesión</button></div>
    </aside>
    <div className="app-main"><header className="app-topbar"><div className="topbar-left"><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">☰</button><span className="breadcrumb-root">Plataforma</span><span className="breadcrumb-sep">/</span><strong>{active?.label || 'Inicio'}</strong></div><div className="topbar-right"><span className="role-chip">{role === 'admin' ? 'ADMINISTRADOR' : 'ESTUDIANTE'}</span><span className="user-avatar">{userName.slice(0, 1).toUpperCase()}</span><div className="topbar-user"><strong>{userName}</strong><small>{role === 'admin' ? 'Administración' : 'Mi cuenta'}</small></div></div></header><main className="app-content">{children}</main><footer className="app-footer">SIMULADOR PNP PRO <span>© 2026 · Plataforma de preparación</span></footer></div>
  </div>
}
