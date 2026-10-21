import { useMemo, useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Search, X } from 'lucide-react'
import { PageHeader } from '../../components/ui'
import { db } from '../../db'
import { getPreviousPerformance, searchExercises } from '../../db/operations'
import type { Exercise, Laterality, LoadType } from '../../domain/types'
import { formatSet } from '../../domain/calculations'

export function ExercisesPage() {
  const exerciseResult = useLiveQuery(() => db.exercises.toArray())
  const exercises = useMemo(() => exerciseResult ?? [], [exerciseResult])
  const [query, setQuery] = useState(''); const [creating, setCreating] = useState(false); const [selected, setSelected] = useState<Exercise>()
  const results = useMemo(() => searchExercises(exercises.filter((item) => !item.isArchived), query), [exercises, query])
  return <main><PageHeader eyebrow={`${exercises.filter((item) => !item.isArchived).length} 个动作`} title="动作库" back action={<button className="button small" onClick={() => setCreating(true)}><Plus size={16} /> 自定义</button>} /><div className="search-wrap"><Search size={19} /><input className="input" placeholder="卧推 / bench / Barbell Bench Press" value={query} onChange={(e) => setQuery(e.target.value)} /></div><section className="card" style={{ marginTop: 14 }}>{results.map((exercise) => <button key={exercise.id} className="list-row" style={{ width: '100%', color: 'inherit', background: 'transparent', borderLeft: 0, borderRight: 0, borderTop: 0, textAlign: 'left' }} onClick={() => setSelected(exercise)}><div className="list-row-main"><strong>{exercise.displayNameZh}</strong><p>{exercise.displayNameEn} · {exercise.equipment}</p></div><span className="chip">{loadLabels[exercise.loadType]}</span></button>)}</section>{creating && <CreateExercise onClose={() => setCreating(false)} />}{selected && <ExerciseDetail exercise={selected} onClose={() => setSelected(undefined)} />}</main>
}

function CreateExercise({ onClose }: { onClose: () => void }) {
  const [zh, setZh] = useState(''); const [en, setEn] = useState(''); const [equipment, setEquipment] = useState('unknown'); const [loadType, setLoadType] = useState<LoadType>('total'); const [laterality, setLaterality] = useState<Laterality>('bilateral')
  const submit = async (e: FormEvent) => { e.preventDefault(); if (!zh.trim() || !en.trim()) return; await db.exercises.add({ id: crypto.randomUUID(), canonicalName: en.trim(), displayNameZh: zh.trim(), displayNameEn: en.trim(), aliases: [], category: 'other', primaryMuscles: [], secondaryMuscles: [], equipment, loadType, laterality, isCustom: true, isArchived: false }); onClose() }
  return <div className="modal-backdrop"><form className="modal" onSubmit={submit}><div className="modal-handle"/><div className="section-header"><h2>自定义动作</h2><button type="button" className="icon-button" onClick={onClose}><X /></button></div><div className="form-grid"><label className="field"><span>中文名称</span><input value={zh} onChange={(e) => setZh(e.target.value)} required /></label><label className="field"><span>英文 / Canonical name</span><input value={en} onChange={(e) => setEn(e.target.value)} required /></label><label className="field"><span>器械</span><input value={equipment} onChange={(e) => setEquipment(e.target.value)} /></label><label className="field"><span>重量语义</span><select value={loadType} onChange={(e) => setLoadType(e.target.value as LoadType)}>{Object.entries(loadLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="field"><span>单双侧</span><select value={laterality} onChange={(e) => setLaterality(e.target.value as Laterality)}><option value="bilateral">双侧</option><option value="unilateral">单侧</option><option value="alternating">交替</option></select></label><button className="button" type="submit">保存动作</button></div></form></div>
}

function ExerciseDetail({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const previous = useLiveQuery(() => getPreviousPerformance(exercise.id), [exercise.id])
  const prs = useLiveQuery(() => db.historicalPRs.where('exerciseId').equals(exercise.id).toArray(), [exercise.id]) ?? []
  const archive = async () => { const used = await db.workoutExercises.where('exerciseId').equals(exercise.id).count(); const message = used ? `此动作已被 ${used} 条训练动作引用，将归档而不会删除历史。继续？` : '归档这个动作？'; if (!window.confirm(message)) return; await db.exercises.update(exercise.id, { isArchived: true }); onClose() }
  return <div className="modal-backdrop"><div className="modal"><div className="modal-handle"/><div className="section-header"><div><h2>{exercise.displayNameZh}</h2><p className="caption" style={{ margin: 0 }}>{exercise.displayNameEn}</p></div><button className="icon-button" onClick={onClose}><X /></button></div><div className="chip-row"><span className="chip">{exercise.equipment}</span><span className="chip">{loadLabels[exercise.loadType]}</span><span className="chip">{exercise.laterality}</span></div><div className="divider"/><h3>最近表现</h3><p className="muted">{previous?.sets.map((set) => formatSet(set, exercise)).join(' · ') || '暂无记录'}</p><h3>历史记录</h3><p className="muted">{prs.map((pr) => `${pr.weightKg ?? ''}${pr.weightKg != null ? ' kg' : ''}${pr.reps ? ` × ${pr.reps}` : ''}`).join(' · ') || '暂无 PR'}</p>{exercise.wristConsideration && <div className="notice">训练考量：{exercise.wristConsideration}</div>}<button className="button danger full" style={{ marginTop: 18 }} onClick={archive}>归档动作</button></div></div>
}

const loadLabels: Record<LoadType, string> = { total: '总重量', per_hand: '每手重量', machine_stack: '器械标示重量', bodyweight: '自重', assisted_bodyweight: '辅助重量' }
