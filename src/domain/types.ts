export type LoadType = 'total' | 'per_hand' | 'machine_stack' | 'bodyweight' | 'assisted_bodyweight'
export type Laterality = 'bilateral' | 'unilateral' | 'alternating'
export type WorkoutStatus = 'in_progress' | 'completed'
export type SideMode = 'reps_per_side' | 'total_reps' | 'left' | 'right'

export interface AthleteProfile {
  id: string
  sex?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  birthYear?: number
  dateOfBirth?: string
  heightCm?: number
  currentWeightKg?: number
  timezone: string
  trainingBackground: string
  primaryGoal: string
  trainingFrequency?: string
  preferredSessionDurationMin?: number
  exercisePreferences?: string
  trainingConsiderations?: string
  notes?: string
  updatedAt: string
}

export interface Goal {
  id: string
  type: 'performance' | 'physique' | 'habit' | 'other'
  exerciseId?: string
  title: string
  target: string
  status: 'active' | 'completed' | 'paused'
  createdAt: string
  completedAt?: string
}

export interface Exercise {
  id: string
  canonicalName: string
  displayNameZh: string
  displayNameEn: string
  aliases: string[]
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'other'
  primaryMuscles: string[]
  secondaryMuscles: string[]
  equipment: string
  loadType: LoadType
  laterality: Laterality
  isCustom: boolean
  isArchived: boolean
  notes?: string
  wristConsideration?: string
}

export interface Workout {
  id: string
  date: string
  startedAt?: string
  endedAt?: string
  title: string
  workoutType: string
  status: WorkoutStatus
  notes?: string
  durationMin?: number
  activeCaloriesKcal?: number
  source: 'manual' | 'import' | 'demo'
  externalMetadata?: Record<string, string | number | boolean>
  createdAt: string
  updatedAt: string
}

export interface WorkoutExercise {
  id: string
  workoutId: string
  exerciseId: string
  order: number
  notes?: string
}

export interface WorkoutSet {
  id: string
  workoutExerciseId: string
  setNumber: number
  weightKg?: number
  reps?: number
  rpe?: number
  isWarmup: boolean
  loadType: LoadType
  sideMode?: SideMode
  technicalFailure?: boolean
  assisted?: boolean
  painScore?: number
  painLocation?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface BodyMeasurement {
  id: string
  date: string
  weightKg: number
  waistCm?: number
  bodyFatPercent?: number
  notes?: string
}

export interface RecoveryNote {
  id: string
  date: string
  relatedWorkoutId?: string
  muscleSoreness?: string
  wristStatus?: string
  jointStatus?: string
  energy?: number
  notes: string
  tolerance?: 'good' | 'mixed' | 'poor'
}

export interface ActivitySession {
  id: string
  date: string
  activityType: string
  durationMin?: number
  notes?: string
}

export type PRRecordType = 'actual_1rm' | 'max_load' | 'rep_pr' | 'estimated_1rm' | 'benchmark_5x5' | 'bodyweight_reps' | 'session_volume'

export interface HistoricalPR {
  id: string
  exerciseId: string
  recordType: PRRecordType
  weightKg?: number
  reps?: number
  sets?: number
  estimated: boolean
  date?: string
  notes?: string
}

export interface WorkoutTemplate {
  id: string
  title: string
  exerciseIds: string[]
  createdAt: string
  updatedAt: string
}

export interface TrainingPlan {
  id: string
  title: string
  status: 'active' | 'completed' | 'archived'
  startDate?: string
  endDate?: string
  content: string
  source: 'ai' | 'self' | 'import'
  createdAt: string
  updatedAt: string
}

export interface BackupData {
  schemaVersion: 1
  exportedAt: string
  appVersion: string
  profile: AthleteProfile[]
  goals: Goal[]
  exercises: Exercise[]
  workouts: Workout[]
  workoutExercises: WorkoutExercise[]
  sets: WorkoutSet[]
  measurements: BodyMeasurement[]
  activities: ActivitySession[]
  recoveryNotes: RecoveryNote[]
  historicalPRs: HistoricalPR[]
  templates: WorkoutTemplate[]
  trainingPlans: TrainingPlan[]
}

export interface WorkoutBundle {
  workout: Workout
  exercises: Array<{
    workoutExercise: WorkoutExercise
    exercise: Exercise
    sets: WorkoutSet[]
  }>
}
