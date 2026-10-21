import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, EmptyState, formatDate } from '../../components/ui'
import { getWorkoutBundles } from '../../db/operations'
import { countWorkingSets } from '../../domain/calculations'

export function HistoryPage() {
  const bundles = useLiveQuery(() => getWorkoutBundles())
  const completed = bundles?.filter((bundle) => bundle.workout.status === 'completed')
  return <main><PageHeader eyebrow="原始记录" title="训练历史" />
    {completed?.length ? <div className="card">{completed.map((bundle) => {
      const date = new Date(`${bundle.workout.date}T12:00:00`)
      const sets = bundle.exercises.reduce((sum, item) => sum + countWorkingSets(item.sets), 0)
      return <Link className="list-row" to={`/history/${bundle.workout.id}`} key={bundle.workout.id}><div className="date-badge"><span>{date.toLocaleDateString('zh-CN', { month: 'short' })}</span><strong>{date.getDate()}</strong></div><div className="list-row-main"><strong>{bundle.workout.title}</strong><p>{bundle.exercises.map((item) => item.exercise.displayNameZh).join('、') || '未添加动作'}</p></div><div style={{ textAlign: 'right' }}><span className="chip">{sets} 组</span><p className="caption" style={{ margin: '6px 0 0' }}>{formatDate(bundle.workout.date)}</p></div><ChevronRight size={18} className="muted" /></Link>
    })}</div> : <EmptyState title="还没有完成的训练" body="训练完成后会按日期倒序显示在这里。" action={<Link className="button" to="/train">开始训练</Link>} />}
  </main>
}
