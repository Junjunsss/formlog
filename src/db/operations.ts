import { db, type FormlogDatabase } from './index'
import type { Exercise, WorkoutBundle } from '../domain/types'

export async function getWorkoutBundle(workoutId: string, database: FormlogDatabase = db): Promise<WorkoutBundle | undefined> {
  const workout = await database.workouts.get(workoutId)
  if (!workout) return undefined
  const links = await database.workoutExercises.where('workoutId').equals(workoutId).sortBy('order')
  const entries = await Promise.all(links.map(async (workoutExercise) => {
    const exercise = await database.exercises.get(workoutExercise.exerciseId)
    const sets = await database.workoutSets.where('workoutExerciseId').equals(workoutExercise.id).sortBy('setNumber')
    return exercise ? { workoutExercise, exercise, sets } : undefined
  }))
  return { workout, exercises: entries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)) }
}

export async function getWorkoutBundles(workoutIds?: string[], database: FormlogDatabase = db): Promise<WorkoutBundle[]> {
  const workouts = workoutIds ? await database.workouts.bulkGet(workoutIds) : await database.workouts.orderBy('date').reverse().toArray()
  const bundles = await Promise.all(workouts.filter((workout): workout is NonNullable<typeof workout> => Boolean(workout)).map((workout) => getWorkoutBundle(workout.id, database)))
  return bundles.filter((bundle): bundle is WorkoutBundle => Boolean(bundle))
}

export async function getPreviousPerformance(exerciseId: string, beforeWorkoutId?: string, database: FormlogDatabase = db): Promise<WorkoutBundle['exercises'][number] | undefined> {
  const current = beforeWorkoutId ? await database.workouts.get(beforeWorkoutId) : undefined
  const links = await database.workoutExercises.where('exerciseId').equals(exerciseId).toArray()
  const workoutMap = new Map((await database.workouts.bulkGet(links.map((link) => link.workoutId))).filter((item): item is NonNullable<typeof item> => Boolean(item)).map((item) => [item.id, item]))
  const previous = links
    .filter((link) => workoutMap.get(link.workoutId)?.status === 'completed' && (!current || workoutMap.get(link.workoutId)!.date <= current.date) && link.workoutId !== beforeWorkoutId)
    .sort((a, b) => workoutMap.get(b.workoutId)!.date.localeCompare(workoutMap.get(a.workoutId)!.date))[0]
  if (!previous) return undefined
  const exercise = await database.exercises.get(exerciseId)
  if (!exercise) return undefined
  return { workoutExercise: previous, exercise, sets: await database.workoutSets.where('workoutExerciseId').equals(previous.id).sortBy('setNumber') }
}

export function searchExercises(exercises: Exercise[], query: string): Exercise[] {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return exercises
  return exercises.filter((exercise) => [exercise.canonicalName, exercise.displayNameZh, exercise.displayNameEn, ...exercise.aliases].some((value) => value.toLocaleLowerCase().includes(normalized)))
}

export async function deleteWorkout(workoutId: string, database: FormlogDatabase = db): Promise<void> {
  await database.transaction('rw', database.workouts, database.workoutExercises, database.workoutSets, async () => {
    const links = await database.workoutExercises.where('workoutId').equals(workoutId).toArray()
    await database.workoutSets.where('workoutExerciseId').anyOf(links.map((link) => link.id)).delete()
    await database.workoutExercises.where('workoutId').equals(workoutId).delete()
    await database.workouts.delete(workoutId)
  })
}

export async function duplicateWorkout(workoutId: string, database: FormlogDatabase = db): Promise<string> {
  const source = await getWorkoutBundle(workoutId, database)
  if (!source) throw new Error('训练记录不存在')
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  await database.transaction('rw', database.workouts, database.workoutExercises, database.workoutSets, async () => {
    await database.workouts.add({ ...source.workout, id, date: now.slice(0, 10), startedAt: now, endedAt: undefined, status: 'in_progress', title: `${source.workout.title}（复制）`, source: 'manual', createdAt: now, updatedAt: now })
    for (const [index, item] of source.exercises.entries()) {
      const linkId = crypto.randomUUID()
      await database.workoutExercises.add({ ...item.workoutExercise, id: linkId, workoutId: id, order: index })
      await database.workoutSets.bulkAdd(item.sets.map((set, setIndex) => ({ ...set, id: crypto.randomUUID(), workoutExerciseId: linkId, setNumber: setIndex + 1, createdAt: now, updatedAt: now })))
    }
  })
  return id
}
