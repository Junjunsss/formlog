import { useEffect, useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Trash2 } from 'lucide-react'
import { db } from '../../db'
import type { AthleteProfile, Goal } from '../../domain/types'
import { PageHeader, localDate } from '../../components/ui'

const emptyProfile = (): AthleteProfile => ({ id: 'primary-athlete', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Singapore', trainingBackground: '', primaryGoal: '', updatedAt: new Date().toISOString() })

export function ProfilePage() {
  const stored = useLiveQuery(() => db.profiles.toCollection().first())
  const goals = useLiveQuery(() => db.goals.toArray()) ?? []
  const latestMeasurement = useLiveQuery(() => db.measurements.orderBy('date').reverse().first())
  const [profile, setProfile] = useState<AthleteProfile>(emptyProfile)
  const [weight, setWeight] = useState('')
  const [weightDate, setWeightDate] = useState(localDate())
  const [saved, setSaved] = useState(false)
  useEffect(() => { if (stored) setProfile(stored) }, [stored])
  useEffect(() => { if (latestMeasurement) { setWeight(String(latestMeasurement.weightKg)); setWeightDate(latestMeasurement.date) } else if (stored?.currentWeightKg) setWeight(String(stored.currentWeightKg)) }, [latestMeasurement, stored])
  const patch = <K extends keyof AthleteProfile>(key: K, value: AthleteProfile[K]) => setProfile((current) => ({ ...current, [key]: value }))
  const submit = async (event: FormEvent) => {
    event.preventDefault(); const now = new Date().toISOString(); const parsedWeight = weight ? Number(weight) : undefined
    await db.transaction('rw', [db.profiles, db.measurements], async () => {
      await db.profiles.put({ ...profile, currentWeightKg: parsedWeight, updatedAt: now })
      if (parsedWeight && (latestMeasurement?.weightKg !== parsedWeight || latestMeasurement.date !== weightDate)) await db.measurements.put({ id: crypto.randomUUID(), date: weightDate, weightKg: parsedWeight })
    }); setSaved(true); window.setTimeout(() => setSaved(false), 1800)
  }
  return <main><PageHeader eyebrow="可编辑长期背景" title="个人档案" back />
    <form onSubmit={submit} className="stack"><section className="card"><h2>基础信息</h2><div className="form-grid two"><Field label="性别"><select value={profile.sex ?? ''} onChange={(e) => patch('sex', e.target.value ? e.target.value as AthleteProfile['sex'] : undefined)}><option value="">不记录</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option></select></Field><Field label="出生年份"><input type="number" value={profile.birthYear ?? ''} onChange={(e) => patch('birthYear', e.target.value ? Number(e.target.value) : undefined)} /></Field><Field label="身高 cm"><input type="number" step="0.1" value={profile.heightCm ?? ''} onChange={(e) => patch('heightCm', e.target.value ? Number(e.target.value) : undefined)} /></Field><Field label="时区"><input value={profile.timezone} onChange={(e) => patch('timezone', e.target.value)} /></Field><Field label="当前体重 kg"><input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field><Field label="测量日期"><input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} /></Field></div></section>
      <section className="card"><h2>训练背景与方向</h2><div className="form-grid"><Field label="训练背景"><textarea value={profile.trainingBackground} onChange={(e) => patch('trainingBackground', e.target.value)} /></Field><Field label="主要目标"><textarea value={profile.primaryGoal} onChange={(e) => patch('primaryGoal', e.target.value)} /></Field><div className="form-grid two"><Field label="理想训练频率"><input value={profile.trainingFrequency ?? ''} onChange={(e) => patch('trainingFrequency', e.target.value)} placeholder="例如 3–4 次 / week" /></Field><Field label="偏好单次时长（分钟）"><input type="number" value={profile.preferredSessionDurationMin ?? ''} onChange={(e) => patch('preferredSessionDurationMin', e.target.value ? Number(e.target.value) : undefined)} /></Field></div><Field label="动作偏好"><textarea value={profile.exercisePreferences ?? ''} onChange={(e) => patch('exercisePreferences', e.target.value)} /></Field><Field label="训练考量（不是医学诊断）"><textarea value={profile.trainingConsiderations ?? ''} onChange={(e) => patch('trainingConsiderations', e.target.value)} /></Field></div></section><button className="button full" type="submit">{saved ? '已保存到本机' : '保存档案'}</button>
    </form>
    <GoalEditor goals={goals} />
  </main>
}

function GoalEditor({ goals }: { goals: Goal[] }) {
  const [title, setTitle] = useState(''); const [target, setTarget] = useState('')
  const add = async () => { if (!title.trim() || !target.trim()) return; await db.goals.add({ id: crypto.randomUUID(), type: 'performance', title: title.trim(), target: target.trim(), status: 'active', createdAt: new Date().toISOString() }); setTitle(''); setTarget('') }
  return <section className="section"><div className="section-header"><h2>目标</h2><span className="caption">无 streak，无逾期</span></div><div className="card">{goals.map((goal) => <div className="list-row" key={goal.id}><div className="list-row-main"><strong>{goal.title}</strong><p>{goal.target}</p></div><select className="input" style={{ width: 104 }} value={goal.status} onChange={(e) => db.goals.update(goal.id, { status: e.target.value as Goal['status'] })}><option value="active">进行中</option><option value="completed">完成</option><option value="paused">暂停</option></select><button className="icon-button" onClick={() => db.goals.delete(goal.id)}><Trash2 size={16} /></button></div>)}<div className="form-grid two" style={{ marginTop: goals.length ? 16 : 0 }}><Field label="目标名称"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如 标准引体" /></Field><Field label="目标"><input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="例如 5 reps" /></Field></div><button className="button secondary full" style={{ marginTop: 12 }} onClick={add}><Plus size={17} /> 添加目标</button></div></section>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label> }
