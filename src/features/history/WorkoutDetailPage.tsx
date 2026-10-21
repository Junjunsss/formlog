import { useLiveQuery } from 'dexie-react-hooks'
import { Copy, Download, Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState, PageHeader, Stat, formatDate } from '../../components/ui'
import { calculateWorkoutVolume, countWorkingSets, formatSet } from '../../domain/calculations'
import { deleteWorkout, duplicateWorkout, getWorkoutBundle } from '../../db/operations'
import { saveBackupToFiles } from '../backup/backup'
import { useState } from 'react'

export function WorkoutDetailPage() {
  const { workoutId = '' } = useParams()
  const navigate = useNavigate()
  const [backupStatus, setBackupStatus] = useState<string>()
  const bundle = useLiveQuery(() => getWorkoutBundle(workoutId), [workoutId])
  if (bundle === undefined) return <main><PageHeader title="训练详情" back /><EmptyState title="找不到这条记录" body="它可能已经被删除。" /></main>
  const sets = bundle.exercises.reduce((sum, item) => sum + countWorkingSets(item.sets), 0)
  const remove = async () => { if (!window.confirm('确定删除这次训练吗？此操作不可撤销，建议先导出备份。')) return; await deleteWorkout(workoutId); navigate('/history', { replace: true }) }
  const duplicate = async () => { const id = await duplicateWorkout(workoutId); navigate(`/workout/${id}`) }
  const lastBackup = localStorage.getItem('formlog:lastBackupAt')
  const needsBackup = !lastBackup || new Date(lastBackup).getTime() < new Date(bundle.workout.updatedAt).getTime()
  const backup = async () => {
    try {
      const result = await saveBackupToFiles()
      setBackupStatus(result === 'shared' ? '分享菜单已打开，请选择“存储到文件”。' : '备份已下载。')
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setBackupStatus('备份未完成，请稍后重试。') }
  }
  return <main><PageHeader eyebrow={formatDate(bundle.workout.date)} title={bundle.workout.title} back action={<Link className="button secondary small" to={`/workout/${workoutId}`}><Pencil size={16} /> 编辑</Link>} />
    <section className="card workout-total"><div className="grid-3"><Stat label="工作组" value={sets} /><Stat label="训练容量" value={Math.round(calculateWorkoutVolume(bundle)).toLocaleString()} hint="kg·reps" /><Stat label="时长" value={bundle.workout.durationMin ?? '—'} hint={bundle.workout.durationMin ? '分钟' : undefined} /></div>{bundle.workout.notes && <p className="muted" style={{ margin: '18px 0 0' }}>{bundle.workout.notes}</p>}</section>
    {needsBackup && <section className="notice" style={{ marginTop: 12 }}><div className="row-between"><div><strong>这次训练还没有进入外部备份</strong><p style={{ margin: '5px 0 0' }}>数据已安全保存在本机；现在可顺手保存一份到 iCloud Drive。</p></div><button className="button small" onClick={backup}><Download size={16}/> 备份</button></div>{backupStatus && <p style={{ margin: '10px 0 0' }}>{backupStatus}</p>}</section>}
    <section className="section stack">{bundle.exercises.map((item) => <div className="card" key={item.workoutExercise.id}><div className="card-header"><div><h2 style={{ marginBottom: 4 }}>{item.exercise.displayNameZh}</h2><p className="caption" style={{ margin: 0 }}>{item.exercise.displayNameEn}</p></div><span className="chip">{countWorkingSets(item.sets)} 组</span></div><div className="divider" />{item.sets.map((set) => <div className="row-between" style={{ minHeight: 37 }} key={set.id}><span className="caption">Set {set.setNumber}</span><strong>{formatSet(set, item.exercise)}</strong></div>)}</div>)}</section>
    <section className="section grid-2"><button className="button secondary" onClick={duplicate}><Copy size={17} /> 复制为新训练</button><button className="button danger" onClick={remove}><Trash2 size={17} /> 删除训练</button></section>
  </main>
}
