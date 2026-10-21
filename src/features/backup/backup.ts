import { backupSchema } from '../../domain/schemas'
import type { BackupData } from '../../domain/types'
import { db, type FormlogDatabase } from '../../db'

const tables = (database: FormlogDatabase) => [
  database.profiles, database.goals, database.exercises, database.workouts, database.workoutExercises,
  database.workoutSets, database.measurements, database.activities, database.recoveryNotes, database.historicalPRs, database.templates,
  database.trainingPlans,
]

export async function createBackup(database: FormlogDatabase = db): Promise<BackupData> {
  return backupSchema.parse({
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    appVersion: '0.1.0',
    profile: await database.profiles.toArray(),
    goals: await database.goals.toArray(),
    exercises: await database.exercises.toArray(),
    workouts: await database.workouts.toArray(),
    workoutExercises: await database.workoutExercises.toArray(),
    sets: await database.workoutSets.toArray(),
    measurements: await database.measurements.toArray(),
    activities: await database.activities.toArray(),
    recoveryNotes: await database.recoveryNotes.toArray(),
    historicalPRs: await database.historicalPRs.toArray(),
    templates: await database.templates.toArray(),
    trainingPlans: await database.trainingPlans.toArray(),
  })
}

export function migrateBackup(input: unknown): BackupData {
  if (typeof input !== 'object' || input === null) throw new Error('备份不是有效对象')
  const record = input as Record<string, unknown>
  if (record.schemaVersion === 0) {
    return backupSchema.parse({
      ...record,
      schemaVersion: 1,
      exportedAt: record.exportedAt ?? new Date(0).toISOString(),
      appVersion: record.appVersion ?? 'legacy',
      measurements: record.measurements ?? record.bodyMeasurements ?? [],
      templates: record.templates ?? [],
      trainingPlans: record.trainingPlans ?? [],
    })
  }
  return backupSchema.parse({ ...record, trainingPlans: record.trainingPlans ?? [] })
}

export function parseBackup(text: string): BackupData {
  let input: unknown
  try { input = JSON.parse(text) } catch { throw new Error('文件不是有效 JSON') }
  try { return migrateBackup(input) } catch (error) {
    if (error instanceof Error) throw new Error(`备份校验失败：${error.message}`)
    throw error
  }
}

export async function importBackup(data: BackupData, mode: 'replace' | 'merge', database: FormlogDatabase = db): Promise<void> {
  const validated = backupSchema.parse(data)
  await database.transaction('rw', tables(database), async () => {
    if (mode === 'replace') await Promise.all(tables(database).map((table) => table.clear()))
    await database.profiles.bulkPut(validated.profile)
    await database.goals.bulkPut(validated.goals)
    await database.exercises.bulkPut(validated.exercises)
    await database.workouts.bulkPut(validated.workouts)
    await database.workoutExercises.bulkPut(validated.workoutExercises)
    await database.workoutSets.bulkPut(validated.sets)
    await database.measurements.bulkPut(validated.measurements)
    await database.activities.bulkPut(validated.activities)
    await database.recoveryNotes.bulkPut(validated.recoveryNotes)
    await database.historicalPRs.bulkPut(validated.historicalPRs)
    await database.templates.bulkPut(validated.templates)
    await database.trainingPlans.bulkPut(validated.trainingPlans)
  })
}

export async function clearDatabase(database: FormlogDatabase = db): Promise<void> {
  await database.transaction('rw', tables(database), async () => Promise.all(tables(database).map((table) => table.clear())))
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function datedBackupFilename(date = new Date()): string {
  const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return `formlog-backup-${day}.json`
}

export async function createBackupFile(database: FormlogDatabase = db): Promise<File> {
  const data = await createBackup(database)
  return new File([JSON.stringify(data, null, 2)], datedBackupFilename(), { type: 'application/json' })
}

export async function shareOrDownloadFile(file: File, title: string): Promise<'shared' | 'downloaded'> {
  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    try {
      await navigator.share({ title, files: [file] })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error
    }
  }
  downloadBlob(file, file.name)
  return 'downloaded'
}

export async function saveBackupToFiles(database: FormlogDatabase = db): Promise<'shared' | 'downloaded'> {
  const result = await shareOrDownloadFile(await createBackupFile(database), 'Formlog 数据备份')
  localStorage.setItem('formlog:lastBackupAt', new Date().toISOString())
  return result
}
