import type { Exercise, WorkoutTemplate } from '../domain/types'

type SeedInput = Omit<Exercise, 'id' | 'isCustom' | 'isArchived' | 'aliases' | 'secondaryMuscles'> & {
  id: string
  aliases?: string[]
  secondaryMuscles?: string[]
}

const exercise = (input: SeedInput): Exercise => ({
  ...input,
  aliases: input.aliases ?? [],
  secondaryMuscles: input.secondaryMuscles ?? [],
  isCustom: false,
  isArchived: false,
})

export const EXERCISE_IDS = {
  bench: '10000000-0000-4000-8000-000000000001', inclineDb: '10000000-0000-4000-8000-000000000002', singleInclineDb: '10000000-0000-4000-8000-000000000003',
  chestMachine: '10000000-0000-4000-8000-000000000004', pecDeck: '10000000-0000-4000-8000-000000000005', cableFly: '10000000-0000-4000-8000-000000000006',
  ropePushdown: '10000000-0000-4000-8000-000000000007', barPushdown: '10000000-0000-4000-8000-000000000008', squat: '10000000-0000-4000-8000-000000000009',
  legPress: '10000000-0000-4000-8000-000000000010', bulgarian: '10000000-0000-4000-8000-000000000011', singleRdl: '10000000-0000-4000-8000-000000000012',
  legExtension: '10000000-0000-4000-8000-000000000013', legCurl: '10000000-0000-4000-8000-000000000014', adductor: '10000000-0000-4000-8000-000000000015',
  pullup: '10000000-0000-4000-8000-000000000016', assistedPullup: '10000000-0000-4000-8000-000000000017', widePulldown: '10000000-0000-4000-8000-000000000018',
  narrowPulldown: '10000000-0000-4000-8000-000000000019', machineRow: '10000000-0000-4000-8000-000000000020', shoulderDb: '10000000-0000-4000-8000-000000000021',
  ohp: '10000000-0000-4000-8000-000000000022', lateralRaise: '10000000-0000-4000-8000-000000000023', reversePecDeck: '10000000-0000-4000-8000-000000000024',
  barbellCurl: '10000000-0000-4000-8000-000000000025', dumbbellCurl: '10000000-0000-4000-8000-000000000026', cableCurl: '10000000-0000-4000-8000-000000000027',
  abCrunch: '10000000-0000-4000-8000-000000000028', reverseCrunch: '10000000-0000-4000-8000-000000000029', legRaise: '10000000-0000-4000-8000-000000000030',
} as const

export const exerciseSeed: Exercise[] = [
  exercise({ id: EXERCISE_IDS.bench, canonicalName: 'Barbell Bench Press', displayNameZh: '平板杠铃卧推', displayNameEn: 'Barbell Bench Press', aliases: ['卧推', 'bench'], category: 'chest', primaryMuscles: ['胸'], secondaryMuscles: ['肱三头肌', '前三角肌'], equipment: 'barbell', loadType: 'total', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.inclineDb, canonicalName: 'Incline Dumbbell Press', displayNameZh: '上斜哑铃卧推', displayNameEn: 'Incline Dumbbell Press', aliases: ['上斜哑铃'], category: 'chest', primaryMuscles: ['胸'], secondaryMuscles: ['肱三头肌', '前三角肌'], equipment: 'dumbbell', loadType: 'per_hand', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.singleInclineDb, canonicalName: 'Single-arm Incline Dumbbell Press', displayNameZh: '单臂上斜哑铃卧推', displayNameEn: 'Single-arm Incline Dumbbell Press', aliases: ['单边上斜哑铃'], category: 'chest', primaryMuscles: ['胸'], secondaryMuscles: ['核心'], equipment: 'dumbbell', loadType: 'per_hand', laterality: 'unilateral' }),
  exercise({ id: EXERCISE_IDS.chestMachine, canonicalName: 'Chest Press Machine', displayNameZh: '坐姿推胸机', displayNameEn: 'Chest Press Machine', category: 'chest', primaryMuscles: ['胸'], equipment: 'machine', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.pecDeck, canonicalName: 'Pec Deck Fly', displayNameZh: '蝴蝶机夹胸', displayNameEn: 'Pec Deck Fly', aliases: ['夹胸'], category: 'chest', primaryMuscles: ['胸'], equipment: 'machine', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.cableFly, canonicalName: 'Cable Fly', displayNameZh: '绳索夹胸', displayNameEn: 'Cable Fly', category: 'chest', primaryMuscles: ['胸'], equipment: 'cable', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.ropePushdown, canonicalName: 'Rope Triceps Pushdown', displayNameZh: '绳索下压', displayNameEn: 'Rope Triceps Pushdown', aliases: ['下压'], category: 'arms', primaryMuscles: ['肱三头肌'], equipment: 'cable', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.barPushdown, canonicalName: 'Straight-bar Triceps Pushdown', displayNameZh: '直杆下压', displayNameEn: 'Straight-bar Triceps Pushdown', category: 'arms', primaryMuscles: ['肱三头肌'], equipment: 'cable', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.squat, canonicalName: 'Back Squat', displayNameZh: '杠铃深蹲', displayNameEn: 'Back Squat', aliases: ['深蹲', 'squat'], category: 'legs', primaryMuscles: ['股四头肌', '臀'], secondaryMuscles: ['腘绳肌'], equipment: 'barbell', loadType: 'total', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.legPress, canonicalName: 'Leg Press', displayNameZh: '腿举', displayNameEn: 'Leg Press', category: 'legs', primaryMuscles: ['股四头肌', '臀'], equipment: 'machine', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.bulgarian, canonicalName: 'Bulgarian Split Squat', displayNameZh: '保加利亚分腿蹲', displayNameEn: 'Bulgarian Split Squat', category: 'legs', primaryMuscles: ['股四头肌', '臀'], equipment: 'dumbbell', loadType: 'per_hand', laterality: 'unilateral' }),
  exercise({ id: EXERCISE_IDS.singleRdl, canonicalName: 'Single-leg Dumbbell Romanian Deadlift', displayNameZh: '单腿哑铃罗马尼亚硬拉', displayNameEn: 'Single-leg Dumbbell RDL', aliases: ['单腿RDL'], category: 'legs', primaryMuscles: ['腘绳肌', '臀'], equipment: 'dumbbell', loadType: 'per_hand', laterality: 'unilateral' }),
  exercise({ id: EXERCISE_IDS.legExtension, canonicalName: 'Leg Extension', displayNameZh: '腿屈伸', displayNameEn: 'Leg Extension', category: 'legs', primaryMuscles: ['股四头肌'], equipment: 'machine', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.legCurl, canonicalName: 'Leg Curl', displayNameZh: '腿弯举', displayNameEn: 'Leg Curl', category: 'legs', primaryMuscles: ['腘绳肌'], equipment: 'machine', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.adductor, canonicalName: 'Hip Adductor Machine', displayNameZh: '髋内收机', displayNameEn: 'Hip Adductor Machine', category: 'legs', primaryMuscles: ['内收肌'], equipment: 'machine', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.pullup, canonicalName: 'Pull-up', displayNameZh: '标准引体向上', displayNameEn: 'Pull-up', aliases: ['引体'], category: 'back', primaryMuscles: ['背'], secondaryMuscles: ['肱二头肌'], equipment: 'bodyweight', loadType: 'bodyweight', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.assistedPullup, canonicalName: 'Assisted Pull-up', displayNameZh: '辅助引体向上', displayNameEn: 'Assisted Pull-up', category: 'back', primaryMuscles: ['背'], equipment: 'machine', loadType: 'assisted_bodyweight', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.widePulldown, canonicalName: 'Wide-grip Lat Pulldown', displayNameZh: '宽握高位下拉', displayNameEn: 'Wide-grip Lat Pulldown', aliases: ['宽握下拉'], category: 'back', primaryMuscles: ['背'], equipment: 'cable machine', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.narrowPulldown, canonicalName: 'Narrow-grip Lat Pulldown', displayNameZh: '窄握高位下拉', displayNameEn: 'Narrow-grip Lat Pulldown', category: 'back', primaryMuscles: ['背'], equipment: 'cable machine', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.machineRow, canonicalName: 'Machine Row', displayNameZh: '固定器械划船', displayNameEn: 'Machine Row', aliases: ['器械划船'], category: 'back', primaryMuscles: ['背'], equipment: 'machine', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.shoulderDb, canonicalName: 'Seated Dumbbell Shoulder Press', displayNameZh: '坐姿哑铃推肩', displayNameEn: 'Seated Dumbbell Shoulder Press', category: 'shoulders', primaryMuscles: ['肩'], secondaryMuscles: ['肱三头肌'], equipment: 'dumbbell', loadType: 'per_hand', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.ohp, canonicalName: 'Standing Barbell Overhead Press', displayNameZh: '站姿杠铃推举', displayNameEn: 'Standing Barbell Overhead Press', aliases: ['OHP', '严格推举'], category: 'shoulders', primaryMuscles: ['肩'], equipment: 'barbell', loadType: 'total', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.lateralRaise, canonicalName: 'Lateral Raise', displayNameZh: '侧平举', displayNameEn: 'Lateral Raise', category: 'shoulders', primaryMuscles: ['肩'], equipment: 'dumbbell', loadType: 'per_hand', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.reversePecDeck, canonicalName: 'Reverse Pec Deck', displayNameZh: '反向蝴蝶机', displayNameEn: 'Reverse Pec Deck', aliases: ['后束飞鸟'], category: 'shoulders', primaryMuscles: ['后三角肌'], equipment: 'machine', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.barbellCurl, canonicalName: 'Barbell Curl', displayNameZh: '杠铃弯举', displayNameEn: 'Barbell Curl', category: 'arms', primaryMuscles: ['肱二头肌'], equipment: 'barbell', loadType: 'total', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.dumbbellCurl, canonicalName: 'Dumbbell Curl', displayNameZh: '哑铃弯举', displayNameEn: 'Dumbbell Curl', category: 'arms', primaryMuscles: ['肱二头肌'], equipment: 'dumbbell', loadType: 'per_hand', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.cableCurl, canonicalName: 'Cable Curl', displayNameZh: '绳索弯举', displayNameEn: 'Cable Curl', category: 'arms', primaryMuscles: ['肱二头肌'], equipment: 'cable', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.abCrunch, canonicalName: 'Abdominal Crunch Machine', displayNameZh: '卷腹机', displayNameEn: 'Abdominal Crunch Machine', category: 'core', primaryMuscles: ['核心'], equipment: 'machine', loadType: 'machine_stack', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.reverseCrunch, canonicalName: 'Reverse Crunch', displayNameZh: '反向卷腹', displayNameEn: 'Reverse Crunch', category: 'core', primaryMuscles: ['核心'], equipment: 'bodyweight', loadType: 'bodyweight', laterality: 'bilateral' }),
  exercise({ id: EXERCISE_IDS.legRaise, canonicalName: 'Leg Raise', displayNameZh: '举腿', displayNameEn: 'Leg Raise', category: 'core', primaryMuscles: ['核心'], equipment: 'bodyweight', loadType: 'bodyweight', laterality: 'bilateral' }),
]

const now = '2026-01-01T00:00:00.000Z'
export const templateSeed: WorkoutTemplate[] = [
  { id: '20000000-0000-4000-8000-000000000001', title: '胸 + 三头', exerciseIds: [EXERCISE_IDS.bench, EXERCISE_IDS.inclineDb, EXERCISE_IDS.pecDeck, EXERCISE_IDS.ropePushdown], createdAt: now, updatedAt: now },
  { id: '20000000-0000-4000-8000-000000000002', title: '腿', exerciseIds: [EXERCISE_IDS.squat, EXERCISE_IDS.legPress, EXERCISE_IDS.singleRdl, EXERCISE_IDS.legExtension], createdAt: now, updatedAt: now },
  { id: '20000000-0000-4000-8000-000000000003', title: '背', exerciseIds: [EXERCISE_IDS.pullup, EXERCISE_IDS.widePulldown, EXERCISE_IDS.narrowPulldown, EXERCISE_IDS.machineRow], createdAt: now, updatedAt: now },
  { id: '20000000-0000-4000-8000-000000000004', title: '肩 + 手臂', exerciseIds: [EXERCISE_IDS.ohp, EXERCISE_IDS.lateralRaise, EXERCISE_IDS.reversePecDeck, EXERCISE_IDS.dumbbellCurl, EXERCISE_IDS.ropePushdown], createdAt: now, updatedAt: now },
]
