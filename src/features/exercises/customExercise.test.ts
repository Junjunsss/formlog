import { describe, expect, it } from 'vitest'
import { buildCustomExercise } from './customExercise'

describe('custom exercise creation', () => {
  it('keeps a user-defined name and portable load semantics', () => {
    const exercise = buildCustomExercise({ name: '火箭推', englishName: '', aliases: 'rocket press，火箭', category: 'shoulders', equipment: 'cable', loadType: 'machine_stack', laterality: 'bilateral' }, 'custom-id')
    expect(exercise).toMatchObject({ id: 'custom-id', canonicalName: '火箭推', displayNameZh: '火箭推', aliases: ['rocket press', '火箭'], primaryMuscles: ['肩'], loadType: 'machine_stack', isCustom: true })
  })

  it('supports explicitly named muscles for unusual movements', () => {
    const exercise = buildCustomExercise({ name: '测试动作', category: 'other', primaryMuscles: '背、核心', loadType: 'per_hand', laterality: 'unilateral' }, 'custom-id')
    expect(exercise.primaryMuscles).toEqual(['背', '核心'])
  })
})
