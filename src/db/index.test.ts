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
})
