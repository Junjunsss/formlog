import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function PageHeader({ eyebrow, title, action, back = false }: { eyebrow?: string; title: string; action?: ReactNode; back?: boolean }) {
  const navigate = useNavigate()
  return <header className="page-header"><div className="title-row">{back && <button type="button" className="icon-button" onClick={() => navigate(-1)} aria-label="返回"><ArrowLeft /></button>}<div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1></div></div>{action}</header>
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-orbit" /><h3>{title}</h3><p>{body}</p>{action}</div>
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong>{hint && <small>{hint}</small>}</div>
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' }).format(new Date(`${date}T12:00:00`))
}

export function localDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function localDateOffset(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
