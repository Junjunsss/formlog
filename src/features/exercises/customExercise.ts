import type { Exercise, Laterality, LoadType } from '../../domain/types'

export interface CustomExerciseInput {
  name: string
  englishName?: string
  aliases?: string
  category: Exercise['category']
  primaryMuscles?: string
  equipment?: string
  loadType: LoadType
  laterality: Laterality
  notes?: string
}

const defaultMuscles: Record<Exercise['category'], string[]> = {
  chest: ['胸'], back: ['背'], legs: ['腿'], shoulders: ['肩'], arms: ['手臂'], core: ['核心'], other: [],
}

function splitList(value?: string): string[] {
  return [...new Set((value ?? '').split(/[,，、|]/).map((item) => item.trim()).filter(Boolean))]
}

export function buildCustomExercise(input: CustomExerciseInput, id: string = crypto.randomUUID()): Exercise {
  const name = input.name.trim()
  const englishName = input.englishName?.trim() || name
  if (!name) throw new Error('动作名称不能为空')
  return {
    id,
    canonicalName: englishName,
    displayNameZh: name,
    displayNameEn: englishName,
    aliases: splitList(input.aliases).filter((alias) => alias !== name && alias !== englishName),
    category: input.category,
    primaryMuscles: splitList(input.primaryMuscles).length ? splitList(input.primaryMuscles) : defaultMuscles[input.category],
    secondaryMuscles: [],
    equipment: input.equipment?.trim() || 'unknown',
    loadType: input.loadType,
    laterality: input.laterality,
    isCustom: true,
    isArchived: false,
    notes: input.notes?.trim() || undefined,
  }
}
