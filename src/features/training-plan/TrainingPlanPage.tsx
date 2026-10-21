import { useEffect, useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Archive, Check, Plus, Save } from 'lucide-react'
import { PageHeader, localDate } from '../../components/ui'
import { db } from '../../db'
import type { TrainingPlan } from '../../domain/types'

export function TrainingPlanPage() {
  const plans = useLiveQuery(() => db.trainingPlans.orderBy('updatedAt').reverse().toArray()) ?? []
  const active = plans.find((plan) => plan.status === 'active')
  const [editing, setEditing] = useState<TrainingPlan | undefined>()
  const [saved, setSaved] = useState(false)
  useEffect(() => { if (!editing && active) setEditing(active) }, [active, editing])

  const create = () => {
    const now = new Date().toISOString()
    setEditing({ id: crypto.randomUUID(), title: '下一阶段训练计划', status: 'active', startDate: localDate(), content: '', source: 'ai', createdAt: now, updatedAt: now })
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!editing?.title.trim() || !editing.content.trim()) return
    await db.transaction('rw', db.trainingPlans, async () => {
      if (editing.status === 'active') {
        const otherActive = await db.trainingPlans.where('status').equals('active').toArray()
        await Promise.all(otherActive.filter((plan) => plan.id !== editing.id).map((plan) => db.trainingPlans.update(plan.id, { status: 'archived', updatedAt: new Date().toISOString() })))
      }
      await db.trainingPlans.put({ ...editing, title: editing.title.trim(), content: editing.content.trim(), updatedAt: new Date().toISOString() })
    })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }
  const patch = <K extends keyof TrainingPlan>(key: K, value: TrainingPlan[K]) => setEditing((current) => current ? { ...current, [key]: value } : current)

  return <main><PageHeader eyebrow="AI 建议保存回数据层" title="阶段计划" back action={<button className="button small" onClick={create}><Plus size={16}/> 新计划</button>} />
    <div className="notice">把 AI 给出的计划粘贴到这里。下次生成“阶段复盘”时，它会自动连同执行记录一起交给 AI。</div>
    {editing ? <form className="section card stack" onSubmit={submit}><div className="form-grid two"><label className="field"><span>计划名称</span><input value={editing.title} onChange={(event) => patch('title', event.target.value)} /></label><label className="field"><span>状态</span><select value={editing.status} onChange={(event) => patch('status', event.target.value as TrainingPlan['status'])}><option value="active">当前执行</option><option value="completed">已完成</option><option value="archived">已归档</option></select></label><label className="field"><span>开始日期</span><input type="date" value={editing.startDate ?? ''} onChange={(event) => patch('startDate', event.target.value || undefined)} /></label><label className="field"><span>结束日期（可选）</span><input type="date" value={editing.endDate ?? ''} onChange={(event) => patch('endDate', event.target.value || undefined)} /></label></div><label className="field"><span>计划正文</span><textarea className="plan-editor" value={editing.content} onChange={(event) => patch('content', event.target.value)} placeholder="从 ChatGPT、Claude 或其他 AI 复制计划到这里…" /></label><button className="button full" type="submit"><Save size={17}/>{saved ? '已保存到本机' : '保存阶段计划'}</button></form> : <section className="section card"><h2>还没有阶段计划</h2><p className="muted">先在 AI Export 生成阶段复盘，让 AI 制定计划，再粘贴回来。</p><button className="button" onClick={create}><Plus size={17}/> 添加计划</button></section>}
    {plans.length > 0 && <section className="section"><div className="section-header"><h2>计划历史</h2></div><div className="card">{plans.map((plan) => <button className="list-row" style={{ width: '100%', color: 'inherit', background: 'transparent', borderLeft: 0, borderRight: 0, borderTop: 0, textAlign: 'left' }} key={plan.id} onClick={() => setEditing(plan)}><span className="brand-mark" style={{ background: plan.status === 'active' ? '#d6ff62' : '#26303b', color: plan.status === 'active' ? '#111609' : '#9aa3af' }}>{plan.status === 'active' ? <Check size={17}/> : <Archive size={17}/>}</span><div className="list-row-main"><strong>{plan.title}</strong><p>{plan.startDate ?? '未设日期'} · {plan.status === 'active' ? '当前执行' : plan.status === 'completed' ? '已完成' : '已归档'}</p></div></button>)}</div></section>}
  </main>
}
