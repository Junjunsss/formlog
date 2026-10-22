import type { BackupData } from '../domain/types'
import { EXERCISE_IDS, exerciseSeed, templateSeed } from './exerciseSeed'

const t = '2026-09-12T10:00:00.000Z'
export const demoSeed: BackupData = {
  schemaVersion: 1, exportedAt: t, appVersion: '0.1.0-demo',
  profile: [{ id: 'demo-profile', sex: 'female', birthYear: 1995, heightCm: 168, currentWeightKg: 62.4, timezone: 'Asia/Singapore', trainingBackground: 'Synthetic demo athlete with recreational strength-training experience.', primaryGoal: 'Build balanced strength and feel athletic.', trainingFrequency: '3 times / week', preferredSessionDurationMin: 60, exercisePreferences: 'Compound lifts and simple machine accessories.', trainingConsiderations: 'No current considerations in this synthetic demo.', updatedAt: t }],
  goals: [{ id: 'demo-goal-1', type: 'performance', exerciseId: EXERCISE_IDS.bench, title: '卧推稳定训练组', target: '50 kg × 5', status: 'active', createdAt: t }, { id: 'demo-goal-2', type: 'physique', title: '均衡发展', target: '稳定训练，保持运动感', status: 'active', createdAt: t }],
  exercises: exerciseSeed,
  workouts: [{ id: 'demo-workout-1', date: '2026-09-12', startedAt: t, endedAt: '2026-09-12T11:02:00.000Z', title: '全身训练', workoutType: 'Full Body', status: 'completed', durationMin: 62, activeCaloriesKcal: 318, source: 'demo', createdAt: t, updatedAt: t }],
  workoutExercises: [{ id: 'demo-we-1', workoutId: 'demo-workout-1', exerciseId: EXERCISE_IDS.bench, order: 0 }, { id: 'demo-we-2', workoutId: 'demo-workout-1', exerciseId: EXERCISE_IDS.squat, order: 1 }, { id: 'demo-we-3', workoutId: 'demo-workout-1', exerciseId: EXERCISE_IDS.widePulldown, order: 2 }],
  sets: [
    { id: 'demo-set-1', workoutExerciseId: 'demo-we-1', setNumber: 1, weightKg: 35, reps: 8, rpe: 7, isWarmup: false, loadType: 'total', createdAt: t, updatedAt: t },
    { id: 'demo-set-2', workoutExerciseId: 'demo-we-1', setNumber: 2, weightKg: 40, reps: 6, rpe: 8, isWarmup: false, loadType: 'total', createdAt: t, updatedAt: t },
    { id: 'demo-set-3', workoutExerciseId: 'demo-we-1', setNumber: 3, weightKg: 40, reps: 6, rpe: 8.5, isWarmup: false, loadType: 'total', createdAt: t, updatedAt: t },
    { id: 'demo-set-4', workoutExerciseId: 'demo-we-2', setNumber: 1, weightKg: 55, reps: 8, rpe: 7, isWarmup: false, loadType: 'total', createdAt: t, updatedAt: t },
    { id: 'demo-set-5', workoutExerciseId: 'demo-we-2', setNumber: 2, weightKg: 60, reps: 6, rpe: 8, isWarmup: false, loadType: 'total', createdAt: t, updatedAt: t },
    { id: 'demo-set-6', workoutExerciseId: 'demo-we-3', setNumber: 1, weightKg: 42.5, reps: 10, rpe: 7.5, isWarmup: false, loadType: 'machine_stack', createdAt: t, updatedAt: t },
    { id: 'demo-set-7', workoutExerciseId: 'demo-we-3', setNumber: 2, weightKg: 42.5, reps: 9, rpe: 8.5, isWarmup: false, loadType: 'machine_stack', createdAt: t, updatedAt: t },
  ],
  measurements: [{ id: 'demo-weight-1', date: '2026-09-12', weightKg: 62.4, notes: 'Synthetic demo measurement.' }],
  activities: [], recoveryNotes: [],
  historicalPRs: [{ id: 'demo-pr-1', exerciseId: EXERCISE_IDS.bench, recordType: 'rep_pr', weightKg: 45, reps: 5, estimated: false, notes: 'Synthetic demo record.' }],
  templates: templateSeed,
  trainingPlans: [{ id: 'demo-plan-1', title: '四周基础力量阶段', status: 'active', startDate: '2026-09-15', endDate: '2026-10-12', content: 'Synthetic demo plan. Train three times weekly and adjust loads from RPE.', source: 'ai', createdAt: t, updatedAt: t }],
}
