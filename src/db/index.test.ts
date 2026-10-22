import Dexie from 'dexie'
import { afterEach, describe, expect, it } from 'vitest'
import { FormlogDatabase, ensureDatabaseSeeded } from './index'
import { exerciseSeed, templateSeed } from '../data/exerciseSeed'

let database: FormlogDatabase | undefined

afterEach(async () => {
  if (database) {
    database.close()
    await database.delete()
    database = undefined
  }
})

describe('database initialization', () => {
  it('is idempotent when React StrictMode initializes concurrently', async () => {
    database = new FormlogDatabase(`seed-test-${crypto.randomUUID()}`)
    await Promise.all([ensureDatabaseSeeded(database), ensureDatabaseSeeded(database)])

    expect(await database.exercises.count()).toBe(exerciseSeed.length)
    expect(await database.templates.count()).toBe(templateSeed.length)
  })

  it('preserves existing workouts while upgrading the database schema', async () => {
    const name = `migration-test-${crypto.randomUUID()}`
    const legacy = new Dexie(name)
    legacy.version(2).stores({
      profiles: '&id', goals: '&id, status, exerciseId', exercises: '&id, canonicalName, category, isArchived',
      workouts: '&id, date, status, updatedAt', workoutExercises: '&id, workoutId, exerciseId, [workoutId+order]',
      workoutSets: '&id, workoutExerciseId, [workoutExerciseId+setNumber]', measurements: '&id, date',
      recoveryNotes: '&id, date, relatedWorkoutId', activities: '&id, date, activityType', historicalPRs: '&id, exerciseId, recordType, date',
      templates: '&id, title, updatedAt',
    })
    await legacy.open()
    await legacy.table('workouts').add({ id: 'existing-workout', date: '2026-10-18', title: 'Existing', workoutType: 'Strength', status: 'completed', source: 'manual', createdAt: '2026-10-18T00:00:00.000Z', updatedAt: '2026-10-18T00:00:00.000Z' })
    legacy.close()

    database = new FormlogDatabase(name)
    await database.open()

    expect((await database.workouts.get('existing-workout'))?.title).toBe('Existing')
    expect(await database.trainingPlans.count()).toBe(0)
  })
})
