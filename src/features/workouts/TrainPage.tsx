import { useLiveQuery } from 'dexie-react-hooks'
import { Dumbbell, LayoutTemplate, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../db'
import { PageHeader, localDate, localDateOffset } from '../../components/ui'
import { useState } from 'react'

export function TrainPage() {
  const navigate = useNavigate()
  const templates = useLiveQuery(() => db.templates.toArray())
  const active = useLiveQuery(() => db.workouts.where('status').equals('in_progress').first())
  const [workoutDate, setWorkoutDate] = useState(localDate())

  const start = async (title: string, exerciseIds: string[] = []) => {
    if (active) { navigate(`/workout/${active.id}`); return }
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await db.transaction('rw', [db.workouts, db.workoutExercises], async () => {
      await db.workouts.add({ id, date: workoutDate, startedAt: now, title, workoutType: title, status: 'in_progress', source: 'manual', createdAt: now, updatedAt: now })
      if (exerciseIds.length) await db.workoutExercises.bulkAdd(exerciseIds.map((exerciseId, order) => ({ id: crypto.randomUUID(), workoutId: id, exerciseId, order })))
    })
    navigate(`/workout/${id}`)
  }

  return <main>
    <PageHeader eyebrow="低负担记录" title="开始训练" />
    {active && <section className="card hero-card" style={{ marginBottom: 28 }}><p className="eyebrow">未完成</p><h2>{active.title}</h2><p className="muted">训练已保存在设备上，可以直接继续。</p><button className="button" onClick={() => navigate(`/workout/${active.id}`)}><Dumbbell size={18} /> 继续训练</button></section>}
    {!active && <section className="card" style={{ marginBottom: 24 }}><div className="row-between"><div><h2 style={{ marginBottom: 5 }}>实际训练日期</h2><p className="caption" style={{ margin: 0 }}>补记昨天或更早的训练时，在这里改日期。</p></div><span className="chip accent">{workoutDate === localDate() ? '今天' : '补记'}</span></div><div className="field" style={{ marginTop: 14 }}><input aria-label="实际训练日期" type="date" max={localDate()} value={workoutDate} onChange={(event) => setWorkoutDate(event.target.value)} /></div><div className="chip-row" style={{ marginTop: 10 }}><button className={`chip ${workoutDate === localDate() ? 'accent' : ''}`} onClick={() => setWorkoutDate(localDate())}>今天</button><button className={`chip ${workoutDate === localDateOffset(-1) ? 'accent' : ''}`} onClick={() => setWorkoutDate(localDateOffset(-1))}>昨天</button></div></section>}
    <section><div className="section-header"><h2>选择方式</h2></div><div className="grid-responsive"><button className="card" style={{ textAlign: 'left', color: 'inherit' }} onClick={() => start('自由训练')}><span className="brand-mark"><Plus size={20} /></span><h2 style={{ marginTop: 18 }}>空白训练</h2><p className="muted" style={{ margin: 0 }}>进入后自由添加动作。</p></button>{templates?.map((template) => <button className="card" style={{ textAlign: 'left', color: 'inherit' }} key={template.id} onClick={() => start(template.title, template.exerciseIds)}><span className="brand-mark" style={{ background: '#26303b', color: '#d6ff62' }}><LayoutTemplate size={20} /></span><h2 style={{ marginTop: 18 }}>{template.title}</h2><p className="muted" style={{ margin: 0 }}>{template.exerciseIds.length} 个动作 · 可随时增删</p></button>)}</div></section>
  </main>
}
