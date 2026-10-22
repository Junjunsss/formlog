import { useState, type FormEvent } from 'react'
import type { Exercise, Laterality, LoadType } from '../../domain/types'
import { buildCustomExercise } from './customExercise'

export const loadLabels: Record<LoadType, string> = {
  total: '总重量（杠铃等）', per_hand: '每手重量（哑铃）', machine_stack: '器械标示重量', bodyweight: '自重', assisted_bodyweight: '辅助重量',
}

const categoryLabels: Record<Exercise['category'], string> = {
  chest: '胸', back: '背', legs: '腿', shoulders: '肩', arms: '手臂', core: '核心', other: '其他 / 混合',
}

export function CustomExerciseForm({ initialName = '', submitLabel = '保存自定义动作', onSave, onCancel }: { initialName?: string; submitLabel?: string; onSave: (exercise: Exercise) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState(initialName)
  const [englishName, setEnglishName] = useState('')
  const [aliases, setAliases] = useState('')
  const [category, setCategory] = useState<Exercise['category']>('other')
  const [primaryMuscles, setPrimaryMuscles] = useState('')
  const [equipment, setEquipment] = useState('unknown')
  const [loadType, setLoadType] = useState<LoadType>('total')
  const [laterality, setLaterality] = useState<Laterality>('bilateral')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try { await onSave(buildCustomExercise({ name, englishName, aliases, category, primaryMuscles, equipment, loadType, laterality, notes })) } finally { setSaving(false) }
  }

  return <form className="form-grid" onSubmit={submit}><label className="field"><span>动作名称 *</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="例如 火箭推" required /></label><label className="field"><span>英文 / Canonical name（可选）</span><input value={englishName} onChange={(event) => setEnglishName(event.target.value)} placeholder="不确定可留空，以后再编辑" /></label><div className="form-grid two"><label className="field"><span>动作分类</span><select value={category} onChange={(event) => setCategory(event.target.value as Exercise['category'])}>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="field"><span>器械</span><input value={equipment} onChange={(event) => setEquipment(event.target.value)} placeholder="unknown / cable / machine…" /></label><label className="field"><span>重量语义 *</span><select value={loadType} onChange={(event) => setLoadType(event.target.value as LoadType)}>{Object.entries(loadLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="field"><span>单双侧</span><select value={laterality} onChange={(event) => setLaterality(event.target.value as Laterality)}><option value="bilateral">双侧</option><option value="unilateral">单侧</option><option value="alternating">交替</option></select></label></div><label className="field"><span>主要肌群（可选）</span><input value={primaryMuscles} onChange={(event) => setPrimaryMuscles(event.target.value)} placeholder="例如 背、核心；留空则按分类填写" /></label><label className="field"><span>搜索别名（可选）</span><input value={aliases} onChange={(event) => setAliases(event.target.value)} placeholder="多个别名用逗号分隔" /></label><label className="field"><span>备注（可选）</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="器械差异、动作要点等" /></label><div className="grid-2"><button className="button ghost" type="button" onClick={onCancel}>取消</button><button className="button" type="submit" disabled={saving}>{saving ? '保存中…' : submitLabel}</button></div></form>
}
