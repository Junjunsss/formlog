import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader, EmptyState, Stat } from '../../components/ui'
import { createBackup } from '../backup/backup'
import { calculateEstimated1RM, calculateSetVolume, calculateWeeklyMuscleSets } from '../../domain/calculations'
import type { BackupData, WorkoutBundle } from '../../domain/types'

export function ProgressPage() {
  const data = useLiveQuery(() => createBackup())
  const strengthExercises = data?.exercises.filter((exercise) => !exercise.isArchived && !['core', 'other'].includes(exercise.category)) ?? []
  const [selectedId, setSelectedId] = useState('10000000-0000-4000-8000-000000000001')
  const selected = strengthExercises.find((exercise) => exercise.id === selectedId) ?? strengthExercises[0]
  const bundles = useMemo(() => data ? buildBundles(data) : [], [data])
  const series = useMemo(() => selected ? bundles.flatMap((bundle) => {
    const item = bundle.exercises.find((entry) => entry.exercise.id === selected.id)
    if (!item?.sets.length) return []
    const working = item.sets.filter((set) => !set.isWarmup)
    return [{ date: bundle.workout.date, e1rm: Math.max(0, ...working.map((set) => calculateEstimated1RM(set.weightKg, set.reps) ?? 0)), topWeight: Math.max(0, ...working.map((set) => set.weightKg ?? 0)), volume: working.reduce((sum, set) => sum + calculateSetVolume(set, item.exercise), 0) }]
  }).reverse() : [], [bundles, selected])
  const maxE1rm = Math.max(0, ...series.map((point) => point.e1rm))
  const maxWeight = Math.max(0, ...series.map((point) => point.topWeight))
  const recentBundles = bundles.filter((bundle) => Date.now() - new Date(`${bundle.workout.date}T12:00:00`).getTime() < 7 * 86400000)
  const weeklySets = calculateWeeklyMuscleSets(recentBundles)
  const weights = [...(data?.measurements ?? [])].sort((a, b) => a.date.localeCompare(b.date))
  const prs = data?.historicalPRs.filter((pr) => pr.exerciseId === selected?.id) ?? []

  return <main><PageHeader eyebrow="趋势，不是评分" title="进度" />
    <section className="card"><div className="field"><span>查看动作</span><select value={selected?.id ?? ''} onChange={(event) => setSelectedId(event.target.value)}>{strengthExercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.displayNameZh} / {exercise.displayNameEn}</option>)}</select></div></section>
    <section className="section"><div className="section-header"><h2>动作进度</h2><span className="chip">Epley · 1–10 reps</span></div>{series.length ? <div className="card"><div className="grid-3" style={{ marginBottom: 22 }}><Stat label="最高重量" value={`${maxWeight} kg`} /><Stat label="最佳估算 1RM" value={`${maxE1rm} kg`} hint="不是实际 1RM" /><Stat label="记录次数" value={series.length} /></div><LineChart points={series.map((point) => ({ label: point.date.slice(5), value: point.e1rm }))} /> <p className="caption" style={{ margin: '12px 0 0' }}>估算 1RM 仅显示 1–10 次范围内的 Epley 结果；原始组数始终保留。</p></div> : <EmptyState title="还没有这个动作的数据" body="完成一堂包含此动作的训练后，这里会显示重量、估算 1RM 与训练容量趋势。" />}</section>
    <section className="section grid-responsive"><div className="card"><div className="section-header"><h2>近 7 天工作组</h2></div>{Object.keys(weeklySets).length ? <div className="stack">{Object.entries(weeklySets).sort((a, b) => b[1] - a[1]).map(([muscle, sets]) => <div key={muscle}><div className="row-between"><span>{muscle}</span><strong>{sets}</strong></div><div className="progress-bar" style={{ marginTop: 8 }}><span style={{ width: `${Math.min(100, sets / Math.max(...Object.values(weeklySets)) * 100)}%` }} /></div></div>)}</div> : <p className="muted">近 7 天暂无完成训练。</p>}</div><div className="card"><div className="section-header"><h2>体重</h2></div>{weights.length ? <><div className="grid-2" style={{ marginBottom: 15 }}><Stat label="最新" value={`${weights[weights.length - 1].weightKg} kg`} hint={weights[weights.length - 1].date} /><Stat label="变化" value={`${(weights[weights.length - 1].weightKg - weights[0].weightKg).toFixed(1)} kg`} /></div><LineChart points={weights.map((item) => ({ label: item.date.slice(5), value: item.weightKg }))} /></> : <p className="muted">体重可以偶尔记录，不要求每日填写。</p>}</div></section>
    <section className="section"><div className="section-header"><h2>历史 PR</h2></div>{prs.length ? <div className="card">{prs.map((pr) => <div className="list-row" key={pr.id}><div className="list-row-main"><strong>{prLabel(pr.recordType)}{pr.estimated ? '（估算）' : ''}</strong><p>{pr.notes ?? '历史记录'}</p></div><strong>{pr.weightKg != null ? `${pr.weightKg} kg` : ''}{pr.reps != null ? ` × ${pr.reps}` : ''}{pr.sets != null ? ` × ${pr.sets}组` : ''}</strong></div>)}</div> : <EmptyState title="暂无历史 PR" body="私人 seed 或未来训练中的 PR 会显示在这里。" />}</section>
  </main>
}

function buildBundles(data: BackupData): WorkoutBundle[] {
  return data.workouts.filter((workout) => workout.status === 'completed').sort((a, b) => b.date.localeCompare(a.date)).map((workout) => ({ workout, exercises: data.workoutExercises.filter((link) => link.workoutId === workout.id).flatMap((workoutExercise) => { const exercise = data.exercises.find((item) => item.id === workoutExercise.exerciseId); return exercise ? [{ workoutExercise, exercise, sets: data.sets.filter((set) => set.workoutExerciseId === workoutExercise.id) }] : [] }) }))
}

function LineChart({ points }: { points: Array<{ label: string; value: number }> }) {
  const shown = points.slice(-10)
  const min = Math.min(...shown.map((point) => point.value))
  const max = Math.max(...shown.map((point) => point.value))
  const range = max - min || 1
  const coords = shown.map((point, index) => ({ ...point, x: shown.length === 1 ? 160 : 24 + index * (272 / (shown.length - 1)), y: 145 - ((point.value - min) / range) * 105 }))
  return <svg className="chart" viewBox="0 0 320 180" role="img" aria-label="趋势图"><line className="axis" x1="24" y1="145" x2="296" y2="145"/><polyline className="line" points={coords.map((point) => `${point.x},${point.y}`).join(' ')} />{coords.map((point, index) => <g key={`${point.label}-${index}`}><circle className="dot" cx={point.x} cy={point.y} r="4"/><text x={point.x} y={point.y - 10} textAnchor="middle">{point.value}</text>{(index === 0 || index === coords.length - 1) && <text x={point.x} y="165" textAnchor="middle">{point.label}</text>}</g>)}</svg>
}

function prLabel(type: string) { return ({ actual_1rm: '实际 1RM', max_load: '最高重量', rep_pr: '次数 PR', estimated_1rm: '估算 1RM', benchmark_5x5: '5×5 基准', bodyweight_reps: '自重次数', session_volume: '单次容量' } as Record<string, string>)[type] ?? type }
