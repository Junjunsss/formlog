import { useLiveQuery } from 'dexie-react-hooks'
import { Dumbbell, LayoutTemplate, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../db'
import { PageHeader, localDate } from '../../components/ui'

export function TrainPage() {
  const navigate = useNavigate()
  const templates = useLiveQuery(() => db.templates.toArray())
  const active = useLiveQuery(() => db.workouts.where('status').equals('in_progress').first())

  const start = async (title: string, exerciseIds: string[] = []) => {
    if (active) { navigate(`/workout/${active.id}`); return }
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await db.transaction('rw', [db.workouts, db.workoutExercises], async () => {
      await db.workouts.add({ id, date: localDate(), startedAt: now, title, workoutType: title, status: 'in_progress', source: 'manual', createdAt: now, updatedAt: now })
      if (exerciseIds.length) await db.workoutExercises.bulkAdd(exerciseIds.map((exerciseId, order) => ({ id: crypto.randomUUID(), workoutId: id, exerciseId, order })))
    })
    navigate(`/workout/${id}`)
  }

  return <main>
    <PageHeader eyebrow="低负担记录" title="开始训练" />
    {active && <section className="card hero-card" style={{ marginBottom: 28 }}><p className="eyebrow">未完成</p><h2>{active.title}</h2><p className="muted">训练已保存在设备上，可以直接继续。</p><button className="button" onClick={() => navigate(`/workout/${active.id}`)}><Dumbbell size={18} /> 继续训练</button></section>}
    <section><div className="section-header"><h2>选择方式</h2></div><div className="grid-responsive"><button className="card" style={{ textAlign: 'left', color: 'inherit' }} onClick={() => start('自由训练')}><span className="brand-mark"><Plus size={20} /></span><h2 style={{ marginTop: 18 }}>空白训练</h2><p className="muted" style={{ margin: 0 }}>进入后自由添加动作。</p></button>{templates?.map((template) => <button className="card" style={{ textAlign: 'left', color: 'inherit' }} key={template.id} onClick={() => start(template.title, template.exerciseIds)}><span className="brand-mark" style={{ background: '#26303b', color: '#d6ff62' }}><LayoutTemplate size={20} /></span><h2 style={{ marginTop: 18 }}>{template.title}</h2><p className="muted" style={{ margin: 0 }}>{template.exerciseIds.length} 个动作 · 可随时增删</p></button>)}</div></section>
  </main>
}
