import { describe, expect, it } from 'vitest'
import { calculateEstimated1RM, calculateSetVolume, countWorkingSets, detectPRs } from './calculations'
import type { Exercise, WorkoutSet } from './types'

const exercise = (overrides: Partial<Exercise> = {}): Exercise => ({ id: 'ex', canonicalName: 'Test', displayNameZh: '测试', displayNameEn: 'Test', aliases: [], category: 'chest', primaryMuscles: ['胸'], secondaryMuscles: [], equipment: 'barbell', loadType: 'total', laterality: 'bilateral', isCustom: false, isArchived: false, ...overrides })
const set = (overrides: Partial<WorkoutSet> = {}): WorkoutSet => ({ id: crypto.randomUUID(), workoutExerciseId: 'we', setNumber: 1, weightKg: 50, reps: 5, rpe: 8, isWarmup: false, loadType: 'total', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', ...overrides })

describe('training calculations', () => {
  it('calculates transparent Epley e1RM only for 1–10 reps', () => {
    expect(calculateEstimated1RM(60, 5)).toBe(70)
    expect(calculateEstimated1RM(60, 1)).toBe(60)
    expect(calculateEstimated1RM(60, 11)).toBeUndefined()
  })
  it('counts per-hand dumbbell load twice for bilateral work', () => {
    expect(calculateSetVolume(set({ weightKg: 12, reps: 10, loadType: 'per_hand' }), exercise({ loadType: 'per_hand', laterality: 'bilateral' }))).toBe(240)
  })
  it('counts unilateral reps-per-side without losing the second side', () => {
    expect(calculateSetVolume(set({ weightKg: 14, reps: 6, loadType: 'per_hand', sideMode: 'reps_per_side' }), exercise({ loadType: 'per_hand', laterality: 'unilateral' }))).toBe(168)
    expect(calculateSetVolume(set({ weightKg: 14, reps: 6, loadType: 'per_hand', sideMode: 'left' }), exercise({ loadType: 'per_hand', laterality: 'unilateral' }))).toBe(84)
  })
  it('excludes warmups and optionally counts effective sets', () => {
    expect(countWorkingSets([set(), set({ isWarmup: true }), set({ rpe: 5 })])).toBe(2)
    expect(countWorkingSets([set(), set({ isWarmup: true }), set({ rpe: 5 })], true)).toBe(1)
  })
  it('detects max load, e1RM, and volume PRs from raw sets', () => {
    const prs = detectPRs([set({ weightKg: 55, reps: 5 })], [set({ weightKg: 50, reps: 5 })], exercise())
    expect(prs.map((pr) => pr.type)).toEqual(['max_load', 'estimated_1rm', 'session_volume'])
  })
})
