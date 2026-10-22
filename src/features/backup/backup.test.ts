import { afterEach, describe, expect, it } from 'vitest'
import { FormlogDatabase } from '../../db'
import { createBackup, importBackup, migrateBackup } from './backup'
import { demoSeed } from '../../data/demoSeed'
import { recoverLocalDataIfNeeded, saveLocalRecoverySnapshot } from './localRecovery'

let database: FormlogDatabase | undefined
afterEach(async () => { if (database) { database.close(); await database.delete(); database = undefined } })

describe('backup and restore', () => {
  it('round-trips all raw records after clearing IndexedDB', async () => {
    database = new FormlogDatabase(`test-${crypto.randomUUID()}`)
    await importBackup(demoSeed, 'replace', database)
    const exported = await createBackup(database)
    await Promise.all(database.tables.map((table) => table.clear()))
    expect(await database.workouts.count()).toBe(0)
    await importBackup(exported, 'replace', database)
    const restored = await createBackup(database)
    expect({ ...restored, exportedAt: exported.exportedAt }).toEqual(exported)
  })
  it('migrates schema v0 bodyMeasurements to v1 measurements', () => {
    const legacy = { ...demoSeed, schemaVersion: 0, bodyMeasurements: demoSeed.measurements, measurements: undefined }
    const migrated = migrateBackup(legacy)
    expect(migrated.schemaVersion).toBe(1)
    expect(migrated.measurements).toEqual(demoSeed.measurements)
  })
  it('imports an existing schema v1 backup without training plans', () => {
    const oldBackup = { ...demoSeed } as Partial<typeof demoSeed>
    delete oldBackup.trainingPlans
    const migrated = migrateBackup(oldBackup)
    expect(migrated.trainingPlans).toEqual([])
  })
  it('rejects structurally invalid backups before mutation', () => {
    expect(() => migrateBackup({ schemaVersion: 1, workouts: 'bad' })).toThrow()
  })
  it('restores an unexpectedly empty database from the device-local update snapshot', async () => {
    database = new FormlogDatabase(`recovery-test-${crypto.randomUUID()}`)
    await importBackup(demoSeed, 'replace', database)
    const responses = new Map<string, Response>()
    const cache = {
      put: async (request: RequestInfo | URL, response: Response) => { responses.set(String(request), response.clone()) },
      match: async (request: RequestInfo | URL) => responses.get(String(request))?.clone(),
    } as unknown as Cache
    const storage = { open: async () => cache, delete: async () => { responses.clear(); return true } } as unknown as CacheStorage

    expect(await saveLocalRecoverySnapshot(database, storage)).toBe(true)
    await Promise.all(database.tables.map((table) => table.clear()))
    expect(await database.workouts.count()).toBe(0)

    expect(await recoverLocalDataIfNeeded(database, storage)).toBe(true)
    expect(await database.workouts.count()).toBe(demoSeed.workouts.length)
    expect((await database.workouts.get('demo-workout-1'))?.activeCaloriesKcal).toBe(318)
  })
})
