import type { Exercise, HistoricalPR, WorkoutBundle, WorkoutSet } from './types'

export function calculateEstimated1RM(weightKg?: number, reps?: number): number | undefined {
  if (weightKg == null || reps == null || reps < 1 || reps > 10) return undefined
  if (reps === 1) return weightKg
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10
}

export function calculateSetVolume(set: WorkoutSet, exercise: Exercise): number {
  if (set.isWarmup || set.weightKg == null || set.reps == null) return 0
  let multiplier = 1
  if (exercise.loadType === 'per_hand' && exercise.laterality === 'bilateral') multiplier = 2
  if (exercise.laterality !== 'bilateral' && set.sideMode === 'reps_per_side') multiplier = 2
  return set.weightKg * set.reps * multiplier
}

export function calculateWorkoutVolume(bundle: WorkoutBundle): number {
  return bundle.exercises.reduce((total, item) => total + item.sets.reduce((sum, set) => sum + calculateSetVolume(set, item.exercise), 0), 0)
}

export function countWorkingSets(sets: WorkoutSet[], effectiveOnly = false): number {
  return sets.filter((set) => !set.isWarmup && (!effectiveOnly || set.rpe == null || set.rpe >= 6)).length
}

export function calculateWeeklyMuscleSets(bundles: WorkoutBundle[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const bundle of bundles) {
    for (const item of bundle.exercises) {
      const count = countWorkingSets(item.sets)
      for (const muscle of item.exercise.primaryMuscles) result[muscle] = (result[muscle] ?? 0) + count
    }
  }
  return result
}

export interface DetectedPR {
  type: HistoricalPR['recordType']
  value: number
  label: string
}

export function detectPRs(currentSets: WorkoutSet[], previousSets: WorkoutSet[], exercise: Exercise): DetectedPR[] {
  const current = currentSets.filter((set) => !set.isWarmup)
  const previous = previousSets.filter((set) => !set.isWarmup)
  const prs: DetectedPR[] = []
  const maxWeight = (sets: WorkoutSet[]) => Math.max(0, ...sets.map((set) => set.weightKg ?? 0))
  if (maxWeight(current) > maxWeight(previous)) prs.push({ type: 'max_load', value: maxWeight(current), label: '最高重量 PR' })
  const maxE1RM = (sets: WorkoutSet[]) => Math.max(0, ...sets.map((set) => calculateEstimated1RM(set.weightKg, set.reps) ?? 0))
  if (maxE1RM(current) > maxE1RM(previous)) prs.push({ type: 'estimated_1rm', value: maxE1RM(current), label: '估算 1RM PR' })
  const currentVolume = current.reduce((sum, set) => sum + calculateSetVolume(set, exercise), 0)
  const previousVolume = previous.reduce((sum, set) => sum + calculateSetVolume(set, exercise), 0)
  if (currentVolume > previousVolume) prs.push({ type: 'session_volume', value: currentVolume, label: '单次容量 PR' })
  return prs
}

export function formatSet(set: WorkoutSet, exercise?: Exercise): string {
  const load = set.loadType === 'bodyweight' ? 'BW' : set.loadType === 'assisted_bodyweight' ? `辅助 ${set.weightKg ?? 0} kg` : `${set.weightKg ?? '—'} kg${set.loadType === 'per_hand' ? ' / hand' : ''}`
  const side = exercise?.laterality !== 'bilateral' && set.sideMode === 'reps_per_side' ? ' / side' : ''
  const rpe = set.rpe == null ? '' : ` @ RPE ${set.rpe}`
  return `${load} × ${set.reps ?? '—'}${side}${rpe}${set.isWarmup ? ' [热身]' : ''}`
}
