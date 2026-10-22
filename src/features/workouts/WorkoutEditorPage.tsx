import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CalendarDays, Check, ChevronDown, MoreHorizontal, Plus, Search, Trash2, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../../db'
import { getPreviousPerformance, getWorkoutBundle, searchExercises } from '../../db/operations'
import type { Exercise, WorkoutSet } from '../../domain/types'
import { calculateWorkoutVolume, countWorkingSets, formatSet } from '../../domain/calculations'
import { formatDate, localDate, localDateOffset } from '../../components/ui'
import { saveLocalRecoverySnapshot } from '../backup/localRecovery'
import { CustomExerciseForm } from '../exercises/CustomExerciseForm'

const rpeOptions = ['', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10']

export function WorkoutEditorPage() {
  const { workoutId = '' } = useParams()
  const navigate = useNavigate()
  const bundle = useLiveQuery(() => getWorkoutBundle(workoutId), [workoutId])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [toast, setToast] = useState<string>()
  const [dateDraft, setDateDraft] = useState('')
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(undefined), 1800); return () => clearTimeout(timer) }, [toast])
  useEffect(() => { if (bundle?.workout.date) setDateDraft(bundle.workout.date) }, [bundle?.workout.date])
  if (!bundle) return <main><div className="workout-sticky"><span className="muted">正在读取训练…</span></div></main>

  const finish = async () => {
    const now = new Date()
    const started = bundle.workout.startedAt ? new Date(bundle.workout.startedAt) : now
    const durationMin = Math.max(1, Math.round((now.getTime() - started.getTime()) / 60000))
    await db.workouts.update(workoutId, { status: 'completed', endedAt: now.toISOString(), durationMin: bundle.workout.durationMin ?? durationMin, updatedAt: now.toISOString() })
    await saveLocalRecoverySnapshot()
    navigate(`/history/${workoutId}`, { replace: true })
  }

  const workingSets = bundle.exercises.reduce((sum, item) => sum + countWorkingSets(item.sets), 0)
  const updateDate = async (date: string) => {
    if (!date || date > localDate()) return
    await db.workouts.update(workoutId, { date, updatedAt: new Date().toISOString() })
    setToast('实际训练日期已更新')
  }
  const chooseDate = async (date: string) => { setDateDraft(date); await updateDate(date) }
  const updateSession = async (patch: { durationMin?: number; activeCaloriesKcal?: number; notes?: string }) => {
    await db.workouts.update(workoutId, { ...patch, updatedAt: new Date().toISOString() })
    setToast('训练信息已保存')
  }
  return <main>
    <div className="workout-sticky"><div className="row-between"><button className="button ghost small" onClick={() => navigate('/')}><X size={17} /> 暂离</button><div style={{ textAlign: 'center' }}><strong>{bundle.workout.title}</strong><div className="caption">{formatDate(bundle.workout.date)} · 自动保存</div></div><button className="button small" onClick={finish}><Check size={17} /> {bundle.workout.status === 'completed' ? '完成编辑' : '完成'}</button></div></div>
    <section className="card" style={{ marginBottom: 12 }}><div className="row-between"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><CalendarDays size={20} color="#d6ff62"/><div><strong>实际训练日期</strong><p className="caption" style={{ margin: '4px 0 0' }}>可修改为过去日期；真实录入时间不会改变。</p></div></div><span className="chip">{bundle.workout.date === localDate() ? '今天' : '补记'}</span></div><div className="field" style={{ marginTop: 12 }}><input aria-label="实际训练日期" type="date" max={localDate()} value={dateDraft} onChange={(event) => setDateDraft(event.target.value)} onBlur={(event) => updateDate(event.currentTarget.value)} /></div><div className="chip-row" style={{ marginTop: 10 }}><button className={`chip ${bundle.workout.date === localDate() ? 'accent' : ''}`} onClick={() => chooseDate(localDate())}>今天</button><button className={`chip ${bundle.workout.date === localDateOffset(-1) ? 'accent' : ''}`} onClick={() => chooseDate(localDateOffset(-1))}>昨天</button></div></section>
    <section className="card" style={{ marginBottom: 12 }}><div className="section-header"><div><h2>训练信息</h2><p className="caption" style={{ margin: 0 }}>可手动填写，也可参考 Apple Watch 后补。</p></div><span className="chip">可选</span></div><div className="form-grid two"><label className="field"><span>运动时长（分钟）</span><input aria-label="运动时长（分钟）" type="number" inputMode="numeric" min="0" step="1" defaultValue={bundle.workout.durationMin ?? ''} placeholder="例如 59" onBlur={(event) => updateSession({ durationMin: event.currentTarget.value ? Number(event.currentTarget.value) : undefined })} /></label><label className="field"><span>活动能量（kcal）</span><input aria-label="活动能量（kcal）" type="number" inputMode="numeric" min="0" step="1" defaultValue={bundle.workout.activeCaloriesKcal ?? ''} placeholder="Apple Watch 可选" onBlur={(event) => updateSession({ activeCaloriesKcal: event.currentTarget.value ? Number(event.currentTarget.value) : undefined })} /></label></div><label className="field" style={{ marginTop: 12 }}><span>本次训练备注</span><textarea aria-label="本次训练备注" defaultValue={bundle.workout.notes ?? ''} placeholder="整体感受、恢复、器械差异等…" onBlur={(event) => updateSession({ notes: event.currentTarget.value.trim() || undefined })} /></label><p className="caption" style={{ margin: '10px 0 0' }}>活动能量仅作辅助背景，不用于评价训练是否“成功”，也不会取代组数、RPE 和恢复反馈。</p></section>
    <div className="stack">{bundle.exercises.map((item) => <ExerciseCard key={item.workoutExercise.id} item={item} workoutId={workoutId} onToast={setToast} />)}</div>
    <button className="button secondary full" style={{ marginTop: 14 }} onClick={() => setPickerOpen(true)}><Plus size={19} /> 添加动作</button>
    <section className="card workout-total" style={{ marginTop: 28 }}><div className="section-header"><h2>本次训练</h2><span className="chip accent">原始数据已保存</span></div><div className="grid-3"><div className="stat"><span>动作</span><strong>{bundle.exercises.length}</strong></div><div className="stat"><span>工作组</span><strong>{workingSets}</strong></div><div className="stat"><span>容量</span><strong>{Math.round(calculateWorkoutVolume(bundle)).toLocaleString()}</strong><small>kg·reps</small></div></div></section>
    {pickerOpen && <ExercisePicker workoutId={workoutId} order={bundle.exercises.length} onClose={() => setPickerOpen(false)} />}
    {toast && <div className="toast">{toast}</div>}
  </main>
}

function ExerciseCard({ item, workoutId, onToast }: { item: NonNullable<Awaited<ReturnType<typeof getWorkoutBundle>>>['exercises'][number]; workoutId: string; onToast: (message: string) => void }) {
  const previous = useLiveQuery(() => getPreviousPerformance(item.exercise.id, workoutId), [item.exercise.id, workoutId])
  const prs = useLiveQuery(() => db.historicalPRs.where('exerciseId').equals(item.exercise.id).toArray(), [item.exercise.id])
  const addSet = async () => {
    const prior = item.sets[item.sets.length - 1]
    const now = new Date().toISOString()
    await db.workoutSets.add({ id: crypto.randomUUID(), workoutExerciseId: item.workoutExercise.id, setNumber: item.sets.length + 1, weightKg: prior?.weightKg, reps: prior?.reps, rpe: undefined, isWarmup: false, loadType: item.exercise.loadType, sideMode: item.exercise.laterality === 'bilateral' ? undefined : 'reps_per_side', createdAt: now, updatedAt: now })
  }
  const removeExercise = async () => {
    if (!window.confirm(`从本次训练移除「${item.exercise.displayNameZh}」及其组数？`)) return
    await db.transaction('rw', [db.workoutExercises, db.workoutSets], async () => {
      await db.workoutSets.where('workoutExerciseId').equals(item.workoutExercise.id).delete()
      await db.workoutExercises.delete(item.workoutExercise.id)
    })
  }
  return <section className="card exercise-card"><div className="exercise-head row-between"><div><h2>{item.exercise.displayNameZh}</h2><p className="caption" style={{ margin: 0 }}>{item.exercise.displayNameEn} · {loadLabel(item.exercise)}</p></div><button className="icon-button" onClick={removeExercise} aria-label="移除动作"><Trash2 size={17} /></button></div>
    {(previous || prs?.length) && <div className="previous-box"><div><strong>上次：</strong> {previous?.sets.filter((set) => !set.isWarmup).map((set) => formatSet(set, previous.exercise)).join(' · ') || '暂无'}</div>{prs?.length ? <div style={{ marginTop: 6 }}><strong>历史：</strong> {prs.map((pr) => `${pr.weightKg ?? ''}${pr.weightKg != null ? 'kg' : ''}${pr.reps ? ` × ${pr.reps}` : ''}${pr.sets ? ` × ${pr.sets}组` : ''}`).join(' · ')}</div> : null}</div>}
    <div className="set-table"><div className="set-row header"><span>#</span><span>重量 kg</span><span>次数</span><span>RPE</span><span /></div>{item.sets.map((set) => <SetRow key={set.id} set={set} exercise={item.exercise} />)}</div>
    <div className="set-actions"><button className="button secondary small" onClick={addSet}><Plus size={16} /> 增加一组</button><button className="button ghost small" onClick={() => onToast(`${item.exercise.displayNameZh} 已保存`)}><Check size={16} /> 保存动作</button></div>
  </section>
}

function SetRow({ set, exercise }: { set: WorkoutSet; exercise: Exercise }) {
  const [details, setDetails] = useState(false)
  const update = async (patch: Partial<WorkoutSet>) => { await db.workoutSets.update(set.id, { ...patch, updatedAt: new Date().toISOString() }) }
  const remove = async () => {
    await db.workoutSets.delete(set.id)
    const remaining = await db.workoutSets.where('workoutExerciseId').equals(set.workoutExerciseId).sortBy('setNumber')
    await Promise.all(remaining.map((item, index) => db.workoutSets.update(item.id, { setNumber: index + 1 })))
  }
  return <div className="set-row"><span className="set-number">{set.setNumber}</span><NumberCell value={set.weightKg} placeholder={set.loadType === 'bodyweight' ? 'BW' : '—'} onCommit={(weightKg) => update({ weightKg })} disabled={set.loadType === 'bodyweight'} /><NumberCell value={set.reps} placeholder="—" integer onCommit={(reps) => update({ reps })} /><select className="set-input" value={set.rpe ?? ''} onChange={(event) => update({ rpe: event.target.value ? Number(event.target.value) : undefined })} aria-label="RPE">{rpeOptions.map((value) => <option key={value} value={value}>{value || '—'}</option>)}</select><button className="icon-button" style={{ width: 38, height: 38, borderRadius: 10 }} onClick={() => setDetails((value) => !value)} aria-label="更多字段"><MoreHorizontal size={17} /></button>
    {details && <div className="details-panel"><label>类型<select value={set.isWarmup ? 'warmup' : 'working'} onChange={(event) => update({ isWarmup: event.target.value === 'warmup' })}><option value="working">工作组</option><option value="warmup">热身组</option></select></label>{exercise.laterality !== 'bilateral' && <label>次数方式<select value={set.sideMode ?? 'reps_per_side'} onChange={(event) => update({ sideMode: event.target.value as WorkoutSet['sideMode'] })}><option value="reps_per_side">每侧次数</option><option value="total_reps">总次数</option><option value="left">仅左侧</option><option value="right">仅右侧</option></select></label>}<label>疼痛 0–10<NumberCell value={set.painScore} placeholder="可选" onCommit={(painScore) => update({ painScore })} /></label><label>疼痛位置<input value={set.painLocation ?? ''} onChange={(event) => update({ painLocation: event.target.value || undefined })} placeholder="可选" /></label><label>备注<input value={set.notes ?? ''} onChange={(event) => update({ notes: event.target.value || undefined })} placeholder="动作感受…" /></label><label style={{ alignContent: 'end' }}><button className="button danger small" onClick={remove}><Trash2 size={15} /> 删除本组</button></label></div>}
  </div>
}

function NumberCell({ value, placeholder, onCommit, integer = false, disabled = false }: { value?: number; placeholder: string; onCommit: (value?: number) => void; integer?: boolean; disabled?: boolean }) {
  const [draft, setDraft] = useState(value?.toString() ?? '')
  useEffect(() => setDraft(value?.toString() ?? ''), [value])
  return <input className="set-input" type="number" inputMode="decimal" step={integer ? 1 : .5} min="0" value={draft} disabled={disabled} placeholder={placeholder} onChange={(event) => setDraft(event.target.value)} onBlur={() => onCommit(draft === '' ? undefined : Number(draft))} />
}

function ExercisePicker({ workoutId, order, onClose }: { workoutId: string; order: number; onClose: () => void }) {
  const exerciseResult = useLiveQuery(() => db.exercises.filter((exercise) => !exercise.isArchived).toArray())
  const exercises = useMemo(() => exerciseResult ?? [], [exerciseResult])
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const results = useMemo(() => searchExercises(exercises, query).slice(0, 50), [exercises, query])
  const add = async (exerciseId: string, exercise?: Exercise) => {
    const now = new Date().toISOString()
    await db.transaction('rw', [db.exercises, db.workoutExercises, db.workouts], async () => {
      if (exercise) await db.exercises.add(exercise)
      await db.workoutExercises.add({ id: crypto.randomUUID(), workoutId, exerciseId, order })
      await db.workouts.update(workoutId, { updatedAt: now })
    })
    onClose()
  }
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="modal"><div className="modal-handle" /><div className="section-header"><div><h2>{creating ? '新建自定义动作' : '添加动作'}</h2>{creating && <p className="caption" style={{ margin: 0 }}>保存后会加入本次训练和永久动作库。</p>}</div><button className="icon-button" onClick={onClose}><X /></button></div>{creating ? <CustomExerciseForm initialName={query} submitLabel="保存并加入训练" onCancel={() => setCreating(false)} onSave={async (exercise) => add(exercise.id, exercise)} /> : <><div className="search-wrap"><Search size={19} /><input className="input" autoFocus placeholder="搜索中文、英文或 alias" value={query} onChange={(event) => setQuery(event.target.value)} /></div><button className="button secondary full" style={{ marginTop: 12 }} onClick={() => setCreating(true)}><Plus size={17}/> {query.trim() ? `新建“${query.trim()}”` : '新建自定义动作'}</button><div style={{ marginTop: 14 }}>{results.length ? results.map((exercise) => <button className="list-row" style={{ width: '100%', background: 'transparent', borderLeft: 0, borderRight: 0, borderTop: 0, color: 'inherit', textAlign: 'left' }} key={exercise.id} onClick={() => add(exercise.id)}><div className="list-row-main"><strong>{exercise.displayNameZh}</strong><p>{exercise.displayNameEn} · {loadLabel(exercise)}</p></div><ChevronDown size={18} style={{ transform: 'rotate(-90deg)' }} /></button>) : <div className="empty-state" style={{ padding: 22 }}><h3>动作库里没有找到</h3><p>可以用上面的名称直接创建，之后每次都能搜索到。</p></div>}</div></>}</div></div>
}

function loadLabel(exercise: Exercise) {
  const load = { total: '总重量', per_hand: '每手重量', machine_stack: '器械标示重量', bodyweight: '自重', assisted_bodyweight: '辅助重量' }[exercise.loadType]
  const side = exercise.laterality === 'unilateral' ? ' · 单侧' : exercise.laterality === 'alternating' ? ' · 交替' : ''
  return load + side
}
