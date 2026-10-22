import type { BackupData, Exercise, WorkoutBundle, WorkoutSet } from '../../domain/types'
import { calculateEstimated1RM, calculateWeeklyMuscleSets, formatSet } from '../../domain/calculations'

export type AIExportFiles = Record<string, string>

const csv = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
const exerciseMap = (data: BackupData) => new Map(data.exercises.map((exercise) => [exercise.id, exercise]))

function buildBundles(data: BackupData): WorkoutBundle[] {
  const exercises = exerciseMap(data)
  return [...data.workouts].sort((a, b) => b.date.localeCompare(a.date)).map((workout) => ({
    workout,
    exercises: data.workoutExercises.filter((link) => link.workoutId === workout.id).sort((a, b) => a.order - b.order).flatMap((workoutExercise) => {
      const exercise = exercises.get(workoutExercise.exerciseId)
      return exercise ? [{ workoutExercise, exercise, sets: data.sets.filter((set) => set.workoutExerciseId === workoutExercise.id).sort((a, b) => a.setNumber - b.setNumber) }] : []
    }),
  }))
}

function bestCurrentSet(sets: WorkoutSet[]): WorkoutSet | undefined {
  return [...sets].filter((set) => !set.isWarmup).sort((a, b) => (calculateEstimated1RM(b.weightKg, b.reps) ?? 0) - (calculateEstimated1RM(a.weightKg, a.reps) ?? 0))[0]
}

function profileMarkdown(data: BackupData): string {
  const profile = data.profile[0]
  const measurements = [...data.measurements].sort((a, b) => b.date.localeCompare(a.date))
  const prs = data.historicalPRs.map((pr) => {
    const exercise = data.exercises.find((item) => item.id === pr.exerciseId)
    return `- ${exercise?.displayNameEn ?? pr.exerciseId}: ${pr.weightKg ?? ''}${pr.weightKg != null ? ' kg' : ''}${pr.reps != null ? ` × ${pr.reps}` : ''}${pr.sets != null ? ` × ${pr.sets} sets` : ''}${pr.estimated ? ' (estimated)' : ''}${pr.notes ? ` — ${pr.notes}` : ''}`
  }).join('\n') || '- No historical records'
  return `# Athlete Profile

## Basics

- Sex: ${profile?.sex ?? 'Not recorded'}
- Birth year: ${profile?.birthYear ?? 'Not recorded'}
- Height: ${profile?.heightCm ?? 'Not recorded'} cm
- Current body weight: ${measurements[0]?.weightKg ?? profile?.currentWeightKg ?? 'Not recorded'} kg${measurements[0] ? ` (${measurements[0].date})` : ''}
- Timezone: ${profile?.timezone ?? 'Not recorded'}
- Typical frequency: ${profile?.trainingFrequency ?? 'Not recorded'}
- Preferred session duration: ${profile?.preferredSessionDurationMin ?? 'Not recorded'} min

## Background

${profile?.trainingBackground || 'Not recorded'}

## Primary goal

${profile?.primaryGoal || 'Not recorded'}

## Exercise preferences

${profile?.exercisePreferences || 'Not recorded'}

## Training considerations

${profile?.trainingConsiderations || 'None recorded. This section is training context, not a medical diagnosis.'}

## Historical PRs

${prs}
`
}

function recentSessionsMarkdown(bundles: WorkoutBundle[], limit = 10): string {
  const content = bundles.filter((bundle) => bundle.workout.status === 'completed').slice(0, limit).map((bundle) => {
    const exercises = bundle.exercises.map((item) => `### ${item.exercise.displayNameEn} / ${item.exercise.displayNameZh}\n\n${item.sets.map((set) => `- ${formatSet(set, item.exercise)}${set.notes ? ` — ${set.notes}` : ''}`).join('\n') || '- No sets'}`).join('\n\n')
    const metadata = [bundle.workout.durationMin != null ? `Duration: ${bundle.workout.durationMin} min` : '', bundle.workout.activeCaloriesKcal != null ? `Active calories: ${bundle.workout.activeCaloriesKcal} kcal` : ''].filter(Boolean).join(' · ')
    return `## ${bundle.workout.date} — ${bundle.workout.title}\n\n${metadata ? `${metadata}\n\n` : ''}${exercises}`
  }).join('\n\n---\n\n')
  return `# Recent Training Sessions\n\n${content || 'No completed sessions yet.'}\n`
}

function aiContext(data: BackupData, bundles: WorkoutBundle[]): string {
  const profile = data.profile[0]
  const latestMeasurement = [...data.measurements].sort((a, b) => b.date.localeCompare(a.date))[0]
  const latestRecovery = [...data.recoveryNotes].sort((a, b) => b.date.localeCompare(a.date))[0]
  const completed = bundles.filter((bundle) => bundle.workout.status === 'completed')
  const latest = completed[0]
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const weekly = calculateWeeklyMuscleSets(completed.filter((bundle) => new Date(`${bundle.workout.date}T12:00:00`) >= cutoff))
  const mainNames = ['Barbell Bench Press', 'Back Squat', 'Pull-up']
  const mainStatus = mainNames.map((name) => {
    for (const bundle of completed) {
      const item = bundle.exercises.find((entry) => entry.exercise.canonicalName === name)
      const best = item && bestCurrentSet(item.sets)
      if (best && item) return `- ${name}: ${formatSet(best, item.exercise)} on ${bundle.workout.date}`
    }
    return `- ${name}: no recent performance recorded`
  }).join('\n')
  const goals = data.goals.filter((goal) => goal.status === 'active').map((goal) => `- ${goal.title}: ${goal.target}`).join('\n') || '- No active goals recorded'
  const weeklyText = Object.entries(weekly).sort((a, b) => b[1] - a[1]).map(([muscle, sets]) => `- ${muscle}: ${sets} working sets`).join('\n') || '- No completed workouts in the last 7 days'
  return `# AI Training Context

Generated: ${new Date().toISOString()}

## Current state

- Current body weight: ${latestMeasurement?.weightKg ?? profile?.currentWeightKg ?? 'Not recorded'} kg${latestMeasurement ? ` (${latestMeasurement.date})` : ''}
- Training status: ${profile?.trainingBackground || 'Not recorded'}
- Latest workout: ${latest ? `${latest.workout.date} — ${latest.workout.title}` : 'None recorded'}
- Last wrist status: ${latestRecovery?.wristStatus ?? 'No recent recovery note'}${latestRecovery ? ` (${latestRecovery.date})` : ''}

## Active goals

${goals}

## Current main lift status

${mainStatus}

## Weekly working sets by primary muscle

${weeklyText}

## Latest recovery note

${latestRecovery ? `Date: ${latestRecovery.date}\n\nSoreness: ${latestRecovery.muscleSoreness ?? 'Not recorded'}\n\nJoint status: ${latestRecovery.jointStatus ?? 'Not recorded'}\n\nWrist: ${latestRecovery.wristStatus ?? 'Not recorded'}\n\nNotes: ${latestRecovery.notes}` : 'No recovery note recorded.'}

## Training considerations for coaching

${profile?.trainingConsiderations || 'No special training considerations recorded.'}

Use the athlete's recorded background rather than assuming a beginner or advanced status. Adjust from actual set performance, RPE/RIR, recent recovery, and symptoms. Treat historical PRs as context rather than automatic prescriptions.
`
}

export function generateCoachUpdate(data: BackupData): string {
  const bundles = buildBundles(data)
  const completed = bundles.filter((bundle) => bundle.workout.status === 'completed')
  const profile = data.profile[0]
  const latestMeasurement = [...data.measurements].sort((a, b) => b.date.localeCompare(a.date))[0]
  const latestRecovery = [...data.recoveryNotes].sort((a, b) => b.date.localeCompare(a.date))[0]
  const activePlan = [...data.trainingPlans].filter((plan) => plan.status === 'active').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 28)
  const recentFourWeeks = completed.filter((bundle) => new Date(`${bundle.workout.date}T12:00:00`) >= cutoff)
  const muscleSets = calculateWeeklyMuscleSets(recentFourWeeks)
  const goals = data.goals.filter((goal) => goal.status === 'active').map((goal) => `- ${goal.title}: ${goal.target}`).join('\n') || '- 尚未记录'
  const volume = Object.entries(muscleSets).sort((a, b) => b[1] - a[1]).map(([muscle, sets]) => `- ${muscle}: ${sets} 工作组`).join('\n') || '- 最近四周没有完成训练'
  const mainStatus = ['Barbell Bench Press', 'Back Squat', 'Pull-up'].map((name) => {
    const exercise = data.exercises.find((item) => item.canonicalName === name)
    for (const bundle of completed) {
      const item = bundle.exercises.find((entry) => entry.exercise.canonicalName === name)
      const best = item && bestCurrentSet(item.sets)
      if (item && best) return `- ${exercise?.displayNameZh ?? name}: ${formatSet(best, item.exercise)} (${bundle.workout.date})`
    }
    const historical = data.historicalPRs.filter((pr) => pr.exerciseId === exercise?.id)[0]
    return `- ${exercise?.displayNameZh ?? name}: 暂无近期表现${historical ? '；历史记录已保留在完整档案中' : ''}`
  }).join('\n')
  const sessions = recentSessionsMarkdown(completed, 10).replace('# Recent Training Sessions\n\n', '')
  return `# Formlog 阶段复盘

生成时间：${new Date().toISOString()}

## 给训练 AI 的任务

请基于下面的原始训练表现、RPE/RIR、近期训练量、恢复反馈和当前阶段计划，评估我目前的状态并制定下一阶段训练方案。请给出：

1. 阶段目标和建议周期
2. 每次训练的动作、工作组、次数范围和目标 RPE/RIR
3. 加重、维持、退阶和减量规则
4. 对右腕、恢复和训练时长的观察点
5. 你做出关键调整的依据

不要把历史 PR 当作当前工作重量。信息不足时请明确指出，不要虚构。

## 运动背景

${profile?.trainingBackground || '尚未记录'}

## 当前目标

${goals}

## 当前状态

- 体重：${latestMeasurement?.weightKg ?? profile?.currentWeightKg ?? '未记录'} kg${latestMeasurement ? `（${latestMeasurement.date}）` : ''}
- 常见训练频率：${profile?.trainingFrequency ?? '未记录'}
- 偏好训练时长：${profile?.preferredSessionDurationMin ?? '未记录'} 分钟
- 最近腕部反馈：${latestRecovery?.wristStatus ?? '没有近期记录'}
- 训练考量：${profile?.trainingConsiderations ?? '无特别记录'}

## 主项近期状态

${mainStatus}

## 最近四周工作组（按主要肌群）

${volume}

## 当前阶段计划

${activePlan ? `### ${activePlan.title}\n\n${activePlan.startDate ?? '未设开始日期'} → ${activePlan.endDate ?? '未设结束日期'}\n\n${activePlan.content}` : '尚未保存阶段计划。请根据记录建立下一阶段计划。'}

## 最近恢复记录

${latestRecovery ? `- 日期：${latestRecovery.date}\n- 肌肉酸痛：${latestRecovery.muscleSoreness ?? '未记录'}\n- 关节：${latestRecovery.jointStatus ?? '未记录'}\n- 手腕：${latestRecovery.wristStatus ?? '未记录'}\n- 备注：${latestRecovery.notes}` : '没有恢复记录。'}

## 最近训练

${sessions}
`
}

function setsCsv(data: BackupData): string {
  const links = new Map(data.workoutExercises.map((link) => [link.id, link]))
  const workouts = new Map(data.workouts.map((workout) => [workout.id, workout]))
  const exercises = exerciseMap(data)
  const rows = data.sets.map((set) => {
    const link = links.get(set.workoutExerciseId)
    const workout = link ? workouts.get(link.workoutId) : undefined
    const exercise = link ? exercises.get(link.exerciseId) : undefined
    return [set.id, workout?.date, workout?.id, exercise?.canonicalName, exercise?.displayNameZh, set.setNumber, set.weightKg, set.reps, set.rpe, set.isWarmup, set.loadType, set.sideMode, set.technicalFailure, set.painScore, set.painLocation, set.notes].map(csv).join(',')
  })
  return ['id,date,workout_id,exercise_en,exercise_zh,set_number,weight_kg,reps,rpe,is_warmup,load_type,side_mode,technical_failure,pain_score,pain_location,notes', ...rows].join('\n')
}

export function generateAIHandoff(data: BackupData): AIExportFiles {
  const bundles = buildBundles(data)
  const profile = data.profile[0]
  const goals = data.goals.filter((goal) => goal.status === 'active').map((goal, index) => `${index + 1}. ${goal.title}：${goal.target}`).join('\n') || '1. 尚未记录当前目标'
  return {
    'coach_update.md': generateCoachUpdate(data),
    'athlete_profile.md': profileMarkdown(data),
    'AI_CONTEXT.md': aiContext(data, bundles),
    'recent_sessions.md': recentSessionsMarkdown(bundles),
    'sets.csv': setsCsv(data),
    'workouts.csv': ['id,date,title,workout_type,status,duration_min,active_calories_kcal,notes', ...data.workouts.map((item) => [item.id, item.date, item.title, item.workoutType, item.status, item.durationMin, item.activeCaloriesKcal, item.notes].map(csv).join(','))].join('\n'),
    'exercises.csv': ['id,canonical_name,display_name_zh,display_name_en,aliases,category,primary_muscles,equipment,load_type,laterality,notes', ...data.exercises.map((item: Exercise) => [item.id, item.canonicalName, item.displayNameZh, item.displayNameEn, item.aliases.join('|'), item.category, item.primaryMuscles.join('|'), item.equipment, item.loadType, item.laterality, item.notes].map(csv).join(','))].join('\n'),
    'ai_handoff_prompt.md': `# Handoff Prompt

以下文件包含我的完整训练背景和近期状态。请先阅读 athlete_profile.md、AI_CONTEXT.md 和 recent_sessions.md，再结合结构化 CSV 继续指导。

我的训练背景摘要：

${profile?.trainingBackground || '尚未记录。请不要擅自推断训练经验。'}

我的当前目标：

${goals}

训练考量：

${profile?.trainingConsiderations || '无特别记录。'}

请优先根据最新训练表现、RPE/RIR、训练量和恢复反馈调整，不要机械地按照历史 PR 给重量。训练考量属于用户自述背景，不应被改写为医学诊断。
`,
  }
}
