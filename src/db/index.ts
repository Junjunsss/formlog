import Dexie, { type EntityTable } from 'dexie'
import type { ActivitySession, AthleteProfile, BodyMeasurement, Exercise, Goal, HistoricalPR, RecoveryNote, TrainingPlan, Workout, WorkoutExercise, WorkoutSet, WorkoutTemplate } from '../domain/types'
import { exerciseSeed, templateSeed } from '../data/exerciseSeed'

export class FormlogDatabase extends Dexie {
  profiles!: EntityTable<AthleteProfile, 'id'>
  goals!: EntityTable<Goal, 'id'>
  exercises!: EntityTable<Exercise, 'id'>
  workouts!: EntityTable<Workout, 'id'>
  workoutExercises!: EntityTable<WorkoutExercise, 'id'>
  workoutSets!: EntityTable<WorkoutSet, 'id'>
  measurements!: EntityTable<BodyMeasurement, 'id'>
  recoveryNotes!: EntityTable<RecoveryNote, 'id'>
  activities!: EntityTable<ActivitySession, 'id'>
  historicalPRs!: EntityTable<HistoricalPR, 'id'>
  templates!: EntityTable<WorkoutTemplate, 'id'>
  trainingPlans!: EntityTable<TrainingPlan, 'id'>

  constructor(name = 'formlog') {
    super(name)
    this.version(1).stores({
      profiles: '&id', goals: '&id, status, exerciseId', exercises: '&id, canonicalName, category, isArchived',
      workouts: '&id, date, status, updatedAt', workoutExercises: '&id, workoutId, exerciseId, [workoutId+order]',
      workoutSets: '&id, workoutExerciseId, [workoutExerciseId+setNumber]', measurements: '&id, date',
      recoveryNotes: '&id, date, relatedWorkoutId', activities: '&id, date, activityType', historicalPRs: '&id, exerciseId, recordType, date',
    })
    this.version(2).stores({
      profiles: '&id', goals: '&id, status, exerciseId', exercises: '&id, canonicalName, category, isArchived',
      workouts: '&id, date, status, updatedAt', workoutExercises: '&id, workoutId, exerciseId, [workoutId+order]',
      workoutSets: '&id, workoutExerciseId, [workoutExerciseId+setNumber]', measurements: '&id, date',
      recoveryNotes: '&id, date, relatedWorkoutId', activities: '&id, date, activityType', historicalPRs: '&id, exerciseId, recordType, date',
      templates: '&id, title, updatedAt',
    })
    this.version(3).stores({
      profiles: '&id', goals: '&id, status, exerciseId', exercises: '&id, canonicalName, category, isArchived',
      workouts: '&id, date, status, updatedAt', workoutExercises: '&id, workoutId, exerciseId, [workoutId+order]',
      workoutSets: '&id, workoutExerciseId, [workoutExerciseId+setNumber]', measurements: '&id, date',
      recoveryNotes: '&id, date, relatedWorkoutId', activities: '&id, date, activityType', historicalPRs: '&id, exerciseId, recordType, date',
      templates: '&id, title, updatedAt', trainingPlans: '&id, status, startDate, updatedAt',
    })
  }
}

export const db = new FormlogDatabase()

export async function ensureDatabaseSeeded(database = db): Promise<void> {
  // React StrictMode intentionally runs effects twice in development. `bulkPut`
  // keeps first-run seeding idempotent if both initializers observe an empty DB.
  if (await database.exercises.count() === 0) await database.exercises.bulkPut(exerciseSeed)
  if (await database.templates.count() === 0) await database.templates.bulkPut(templateSeed)
}
