import { z } from 'zod'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const isoDateTime = z.string().datetime({ offset: true })
const optionalText = z.string().optional()
const loadType = z.enum(['total', 'per_hand', 'machine_stack', 'bodyweight', 'assisted_bodyweight'])
const laterality = z.enum(['bilateral', 'unilateral', 'alternating'])

export const athleteProfileSchema = z.object({
  id: z.string().min(1), sex: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  birthYear: z.number().int().min(1900).max(2200).optional(), dateOfBirth: isoDate.optional(),
  heightCm: z.number().positive().max(300).optional(), currentWeightKg: z.number().positive().max(1000).optional(),
  timezone: z.string().min(1), trainingBackground: z.string(), primaryGoal: z.string(),
  trainingFrequency: optionalText, preferredSessionDurationMin: z.number().positive().optional(),
  exercisePreferences: optionalText, trainingConsiderations: optionalText, notes: optionalText,
  updatedAt: isoDateTime,
})

export const goalSchema = z.object({
  id: z.string().min(1), type: z.enum(['performance', 'physique', 'habit', 'other']), exerciseId: optionalText,
  title: z.string().min(1), target: z.string().min(1), status: z.enum(['active', 'completed', 'paused']),
  createdAt: isoDateTime, completedAt: isoDateTime.optional(),
})

export const exerciseSchema = z.object({
  id: z.string().min(1), canonicalName: z.string().min(1), displayNameZh: z.string().min(1), displayNameEn: z.string().min(1),
  aliases: z.array(z.string()), category: z.enum(['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'other']),
  primaryMuscles: z.array(z.string()), secondaryMuscles: z.array(z.string()), equipment: z.string(),
  loadType, laterality, isCustom: z.boolean(), isArchived: z.boolean(), notes: optionalText, wristConsideration: optionalText,
})

export const workoutSchema = z.object({
  id: z.string().min(1), date: isoDate, startedAt: isoDateTime.optional(), endedAt: isoDateTime.optional(),
  title: z.string().min(1), workoutType: z.string(), status: z.enum(['in_progress', 'completed']), notes: optionalText,
  durationMin: z.number().nonnegative().optional(), activeCaloriesKcal: z.number().nonnegative().optional(), source: z.enum(['manual', 'import', 'demo']),
  externalMetadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(), createdAt: isoDateTime, updatedAt: isoDateTime,
})

export const workoutExerciseSchema = z.object({
  id: z.string().min(1), workoutId: z.string().min(1), exerciseId: z.string().min(1), order: z.number().int().nonnegative(), notes: optionalText,
})

export const workoutSetSchema = z.object({
  id: z.string().min(1), workoutExerciseId: z.string().min(1), setNumber: z.number().int().positive(),
  weightKg: z.number().nonnegative().optional(), reps: z.number().int().nonnegative().optional(), rpe: z.number().min(0).max(10).optional(),
  isWarmup: z.boolean(), loadType, sideMode: z.enum(['reps_per_side', 'total_reps', 'left', 'right']).optional(),
  technicalFailure: z.boolean().optional(), assisted: z.boolean().optional(), painScore: z.number().min(0).max(10).optional(),
  painLocation: optionalText, notes: optionalText, createdAt: isoDateTime, updatedAt: isoDateTime,
})

export const bodyMeasurementSchema = z.object({
  id: z.string().min(1), date: isoDate, weightKg: z.number().positive(), waistCm: z.number().positive().optional(),
  bodyFatPercent: z.number().min(0).max(100).optional(), notes: optionalText,
})

export const recoveryNoteSchema = z.object({
  id: z.string().min(1), date: isoDate, relatedWorkoutId: optionalText, muscleSoreness: optionalText, wristStatus: optionalText,
  jointStatus: optionalText, energy: z.number().min(1).max(5).optional(), notes: z.string(), tolerance: z.enum(['good', 'mixed', 'poor']).optional(),
})

export const activitySessionSchema = z.object({
  id: z.string().min(1), date: isoDate, activityType: z.string().min(1), durationMin: z.number().nonnegative().optional(), notes: optionalText,
})

export const historicalPRSchema = z.object({
  id: z.string().min(1), exerciseId: z.string().min(1),
  recordType: z.enum(['actual_1rm', 'max_load', 'rep_pr', 'estimated_1rm', 'benchmark_5x5', 'bodyweight_reps', 'session_volume']),
  weightKg: z.number().nonnegative().optional(), reps: z.number().int().nonnegative().optional(), sets: z.number().int().positive().optional(),
  estimated: z.boolean(), date: isoDate.optional(), notes: optionalText,
})

export const workoutTemplateSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), exerciseIds: z.array(z.string()), createdAt: isoDateTime, updatedAt: isoDateTime,
})

export const trainingPlanSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), status: z.enum(['active', 'completed', 'archived']),
  startDate: isoDate.optional(), endDate: isoDate.optional(), content: z.string(), source: z.enum(['ai', 'self', 'import']),
  createdAt: isoDateTime, updatedAt: isoDateTime,
})

export const backupSchema = z.object({
  schemaVersion: z.literal(1), exportedAt: isoDateTime, appVersion: z.string(),
  profile: z.array(athleteProfileSchema), goals: z.array(goalSchema), exercises: z.array(exerciseSchema),
  workouts: z.array(workoutSchema), workoutExercises: z.array(workoutExerciseSchema), sets: z.array(workoutSetSchema),
  measurements: z.array(bodyMeasurementSchema), activities: z.array(activitySessionSchema), recoveryNotes: z.array(recoveryNoteSchema),
  historicalPRs: z.array(historicalPRSchema), templates: z.array(workoutTemplateSchema).default([]),
  trainingPlans: z.array(trainingPlanSchema).default([]),
})
