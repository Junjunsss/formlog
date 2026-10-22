import { db, type FormlogDatabase } from '../../db'
import type { BackupData } from '../../domain/types'
import { createBackup, importBackup, parseBackup } from './backup'

const RECOVERY_CACHE = 'formlog-local-recovery-v1'
const RECOVERY_KEY = './__formlog_local_recovery__.json'

function hasPrivateData(data: BackupData): boolean {
  return data.profile.length > 0 || data.goals.length > 0 || data.workouts.length > 0 || data.measurements.length > 0 || data.activities.length > 0 || data.recoveryNotes.length > 0 || data.historicalPRs.length > 0 || data.trainingPlans.length > 0
}

async function databaseHasPrivateData(database: FormlogDatabase): Promise<boolean> {
  const counts = await Promise.all([
    database.profiles.count(), database.goals.count(), database.workouts.count(), database.measurements.count(),
    database.activities.count(), database.recoveryNotes.count(), database.historicalPRs.count(), database.trainingPlans.count(),
  ])
  return counts.some((count) => count > 0)
}

function availableCacheStorage(): CacheStorage | undefined {
  return typeof caches === 'undefined' ? undefined : caches
}

export async function saveLocalRecoverySnapshot(database: FormlogDatabase = db, storage: CacheStorage | undefined = availableCacheStorage()): Promise<boolean> {
  if (!storage) return false
  try {
    const data = await createBackup(database)
    if (!hasPrivateData(data)) return false
    const cache = await storage.open(RECOVERY_CACHE)
    await cache.put(RECOVERY_KEY, new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }))
    if (typeof localStorage !== 'undefined') localStorage.setItem('formlog:lastLocalSnapshotAt', data.exportedAt)
    return true
  } catch { return false }
}

export async function readLocalRecoverySnapshot(storage: CacheStorage | undefined = availableCacheStorage()): Promise<BackupData | undefined> {
  if (!storage) return undefined
  try {
    const response = await (await storage.open(RECOVERY_CACHE)).match(RECOVERY_KEY)
    return response ? parseBackup(await response.text()) : undefined
  } catch { return undefined }
}

export async function recoverLocalDataIfNeeded(database: FormlogDatabase = db, storage: CacheStorage | undefined = availableCacheStorage()): Promise<boolean> {
  if (await databaseHasPrivateData(database)) return false
  const snapshot = await readLocalRecoverySnapshot(storage)
  if (!snapshot || !hasPrivateData(snapshot)) return false
  await importBackup(snapshot, 'replace', database)
  return true
}

export async function clearLocalRecoverySnapshot(storage: CacheStorage | undefined = availableCacheStorage()): Promise<void> {
  try { if (storage) await storage.delete(RECOVERY_CACHE) } catch { /* Cache Storage is best-effort. */ }
  if (typeof localStorage !== 'undefined') localStorage.removeItem('formlog:lastLocalSnapshotAt')
}
