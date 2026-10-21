import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { db } from '../../db'
import { getWorkoutBundles } from '../../db/operations'
import { calculateWeeklyMuscleSets, countWorkingSets, formatSet } from '../../domain/calculations'
import { EmptyState, PageHeader, Stat, formatDate, localDate } from '../../components/ui'

export function TodayPage() {
  const bundles = useLiveQuery(() => getWorkoutBundles())
  const goals = useLiveQuery(() => db.goals.where('status').equals('active').toArray())
  const latest = bundles?.find((item) => item.workout.status === 'completed')
  const active = bundles?.find((item) => item.workout.status === 'in_progress')
  const now = new Date(`${localDate()}T12:00:00`)
  const weekStart = new Date(now)
  const day = (now.getDay() + 6) % 7
  weekStart.setDate(now.getDate() - day)
  const thisWeek = bundles?.filter((item) => item.workout.status === 'completed' && new Date(`${item.workout.date}T12:00:00`) >= weekStart) ?? []
  const muscleSets = calculateWeeklyMuscleSets(thisWeek)
  const topMuscles = Object.entries(muscleSets).sort((a, b) => b[1] - a[1]).slice(0, 3)

  return <main>
    <PageHeader eyebrow="Private · Offline" title="今天" action={<span className="chip accent">数据只在本机</span>} />
    {active ? <section className="card hero-card"><p className="eyebrow">训练进行中</p><h2>{active.workout.title}</h2><p className="muted">{active.exercises.length} 个动作 · 已自动保存到本地</p><Link className="button" to={`/workout/${active.workout.id}`}>继续训练 <ArrowRight size={18} /></Link></section> : <section className="card hero-card"><p className="eyebrow">Ready when you are</p><h2>下一次训练，从这里开始。</h2><p className="muted">没有打卡压力。练完一个动作，再一次记完所有组。</p><Link className="button" to="/train"><Plus size={18} /> 新建训练</Link></section>}

    <section className="section"><div className="section-header"><h2>当前目标</h2><Link to="/profile">编辑</Link></div>
      {goals?.length ? <div className="grid-responsive">{goals.slice(0, 4).map((goal) => <div className="card" key={goal.id}><span className="caption">{goal.type === 'physique' ? '体型' : '表现'}</span><h3 style={{ marginTop: 8 }}>{goal.title}</h3><p className="muted" style={{ marginBottom: 0 }}>{goal.target}</p></div>)}</div> : <EmptyState title="还没有目标" body="目标是方向，不是任务清单。可在个人档案中添加。" action={<Link className="button secondary small" to="/profile">设置档案</Link>} />}
    </section>

    <section className="section"><div className="section-header"><h2>最近训练</h2><Link to="/history">全部历史</Link></div>
      {latest ? <Link to={`/history/${latest.workout.id}`} className="card" style={{ display: 'block' }}><div className="card-header"><div><p className="eyebrow">{formatDate(latest.workout.date)}</p><h2>{latest.workout.title}</h2></div><ArrowRight className="muted" /></div><div className="stack">{latest.exercises.slice(0, 3).map((item) => <div className="row-between" key={item.workoutExercise.id}><div><strong>{item.exercise.displayNameZh}</strong><p className="caption" style={{ margin: '4px 0 0' }}>{item.sets.length ? formatSet(item.sets[item.sets.length - 1], item.exercise) : '未记录组'}</p></div><span className="chip">{countWorkingSets(item.sets)} 组</span></div>)}</div></Link> : <EmptyState title="还没有训练记录" body="第一条记录会在这里出现；刷新或离线重开也不会消失。" />}
    </section>

    <section className="section"><div className="section-header"><h2>本周</h2><Link to="/progress">查看进度</Link></div><div className="card"><div className="grid-3"><Stat label="训练" value={thisWeek.length} hint="次" />{topMuscles.length ? topMuscles.slice(0, 2).map(([muscle, sets]) => <Stat key={muscle} label={muscle} value={sets} hint="工作组" />) : <><Stat label="工作组" value="—" /><Stat label="状态" value="轻松来" /></>}</div></div></section>
  </main>
}
