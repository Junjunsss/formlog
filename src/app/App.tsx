import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ensureDatabaseSeeded } from '../db'
import { AppShell } from '../components/AppShell'
import { TodayPage } from '../features/dashboard/TodayPage'
import { TrainPage } from '../features/workouts/TrainPage'
import { WorkoutEditorPage } from '../features/workouts/WorkoutEditorPage'
import { HistoryPage } from '../features/history/HistoryPage'
import { WorkoutDetailPage } from '../features/history/WorkoutDetailPage'

const ProgressPage = lazy(() => import('../features/progress/ProgressPage').then((module) => ({ default: module.ProgressPage })))
const MorePage = lazy(() => import('../features/more/MorePage').then((module) => ({ default: module.MorePage })))
const ProfilePage = lazy(() => import('../features/profile/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const ExercisesPage = lazy(() => import('../features/exercises/ExercisesPage').then((module) => ({ default: module.ExercisesPage })))
const BackupPage = lazy(() => import('../features/backup/BackupPage').then((module) => ({ default: module.BackupPage })))
const AIExportPage = lazy(() => import('../features/ai-export/AIExportPage').then((module) => ({ default: module.AIExportPage })))
const RecoveryActivityPage = lazy(() => import('../features/recovery/RecoveryActivityPage').then((module) => ({ default: module.RecoveryActivityPage })))
const TrainingPlanPage = lazy(() => import('../features/training-plan/TrainingPlanPage').then((module) => ({ default: module.TrainingPlanPage })))

export function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string>()
  useEffect(() => {
    ensureDatabaseSeeded().then(() => setReady(true)).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : '数据库初始化失败'))
  }, [])

  if (error) return <main className="boot"><div><h1>无法打开本地数据库</h1><p>{error}</p></div></main>
  if (!ready) return <main className="boot"><div className="brand-mark" aria-label="Formlog">F</div><p>正在打开本地训练记录…</p></main>

  return <Suspense fallback={<main className="boot"><p>正在打开本地页面…</p></main>}>
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<TodayPage />} />
        <Route path="train" element={<TrainPage />} />
        <Route path="workout/:workoutId" element={<WorkoutEditorPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="history/:workoutId" element={<WorkoutDetailPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="more" element={<MorePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="exercises" element={<ExercisesPage />} />
        <Route path="backup" element={<BackupPage />} />
        <Route path="ai-export" element={<AIExportPage />} />
        <Route path="recovery" element={<RecoveryActivityPage />} />
        <Route path="training-plan" element={<TrainingPlanPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </Suspense>
}
