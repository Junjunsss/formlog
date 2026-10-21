import { Activity, ChartNoAxesCombined, Dumbbell, Ellipsis, House } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const items = [
  { to: '/', label: '今天', icon: House },
  { to: '/train', label: '训练', icon: Dumbbell },
  { to: '/history', label: '历史', icon: Activity },
  { to: '/progress', label: '进度', icon: ChartNoAxesCombined },
  { to: '/more', label: '更多', icon: Ellipsis },
]

export function AppShell() {
  const location = useLocation()
  const hideMobileNav = location.pathname.startsWith('/workout/')
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <NavLink to="/" className="sidebar-brand"><span className="brand-mark">F</span><span>Formlog</span></NavLink>
        <nav>{items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'}><Icon size={20} /><span>{label}</span></NavLink>)}</nav>
        <p className="privacy-note">Local first · No tracking</p>
      </aside>
      <div className="content-wrap">
        <Outlet />
      </div>
      {!hideMobileNav && <nav className="bottom-nav" aria-label="主导航">{items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'}><Icon size={21} /><span>{label}</span></NavLink>)}</nav>}
    </div>
  )
}
