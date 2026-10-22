import { useState } from 'react'
import { RefreshCw, ShieldCheck, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { saveLocalRecoverySnapshot } from '../features/backup/localRecovery'

export function PWAUpdatePrompt() {
  const [updating, setUpdating] = useState(false)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration) window.setInterval(() => registration.update(), 60 * 60 * 1000)
    },
  })

  const update = async () => {
    setUpdating(true)
    try {
      await saveLocalRecoverySnapshot()
      await updateServiceWorker(true)
    } finally { setUpdating(false) }
  }

  if (!needRefresh && !offlineReady) return null
  return <div className="update-banner" role="status"><div className="update-icon">{needRefresh ? <RefreshCw size={19}/> : <ShieldCheck size={19}/>}</div><div><strong>{needRefresh ? 'Formlog 有新版本' : '离线使用已就绪'}</strong><p>{needRefresh ? '更新前会先在本机保存恢复快照，训练数据不会随代码更新被替换。' : '应用文件已缓存；训练数据继续保存在本机。'}</p></div>{needRefresh ? <button className="button small" disabled={updating} onClick={update}>{updating ? '保护数据中…' : '安全更新'}</button> : <button className="icon-button" onClick={() => setOfflineReady(false)} aria-label="关闭"><X size={16}/></button>}{needRefresh && <button className="icon-button" onClick={() => setNeedRefresh(false)} aria-label="稍后更新"><X size={16}/></button>}</div>
}
