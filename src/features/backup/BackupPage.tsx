import { useRef, useState } from 'react'
import { DatabaseBackup, Download, FileUp, FlaskConical, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/ui'
import { clearDatabase, importBackup, parseBackup, saveBackupToFiles } from './backup'
import { demoSeed } from '../../data/demoSeed'
import { ensureDatabaseSeeded } from '../../db'

export function BackupPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'replace' | 'merge'>('replace')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string }>()
  const lastBackup = localStorage.getItem('formlog:lastBackupAt')
  const handleFile = async (file?: File) => {
    if (!file) return
    try {
      const data = parseBackup(await file.text())
      if (mode === 'replace' && !window.confirm(`这会用备份中的 ${data.workouts.length} 条训练替换本机数据库。确认继续？`)) return
      await importBackup(data, mode)
      setStatus({ type: 'success', message: `恢复完成：${data.workouts.length} 条训练、${data.sets.length} 个训练组。` })
    } catch (error) { setStatus({ type: 'error', message: error instanceof Error ? error.message : '导入失败' }) }
    finally { if (inputRef.current) inputRef.current.value = '' }
  }
  const loadDemo = async () => { if (!window.confirm('加载演示数据会替换当前数据库。请先备份真实数据。继续？')) return; await importBackup(demoSeed, 'replace'); setStatus({ type: 'success', message: '已加载完全虚构的演示数据。' }) }
  const clear = async () => { if (!window.confirm('清空所有本地档案、训练和记录？此操作无法撤销。')) return; if (!window.confirm('再次确认：你是否已导出备份？')) return; await clearDatabase(); await ensureDatabaseSeeded(); setStatus({ type: 'success', message: '私人数据已清空，基础动作库已恢复。' }) }
  return <main><PageHeader eyebrow="Versioned · Portable" title="备份与恢复" back />
    <section className="card hero-card"><DatabaseBackup size={28} color="#d6ff62"/><h2 style={{ marginTop: 18 }}>把完整备份存到 iCloud Drive。</h2><p className="muted">iPhone 会打开系统分享菜单，选择“存储到文件”并保存到 iCloud Drive。文件名自动包含日期。</p>{lastBackup && <p className="caption">本设备上次备份：{new Date(lastBackup).toLocaleString('zh-CN')}</p>}<button className="button" onClick={() => saveBackupToFiles().then((result) => setStatus({ type: 'success', message: result === 'shared' ? '已打开系统分享菜单，请选择“存储到文件”。' : '备份已下载，请保存到可靠位置。' })).catch((error: unknown) => { if (!(error instanceof DOMException && error.name === 'AbortError')) setStatus({ type: 'error', message: '备份未完成，请重试。' }) })}><Download size={18}/> 保存带日期的完整备份</button></section>
    <section className="section card"><h2>导入备份</h2><p className="muted">文件会先通过版本和字段校验，校验失败不会修改本地数据库。</p><div className="field" style={{ marginBottom: 13 }}><span>导入方式</span><select value={mode} onChange={(e) => setMode(e.target.value as 'replace' | 'merge')}><option value="replace">替换本地数据库（完整恢复）</option><option value="merge">按稳定 ID 合并</option></select></div><input ref={inputRef} hidden type="file" accept="application/json,.json" onChange={(e) => handleFile(e.target.files?.[0])}/><button className="button secondary full" onClick={() => inputRef.current?.click()}><FileUp size={18}/> 选择 JSON 文件</button></section>
    {status && <div className={`notice ${status.type}`} style={{ marginTop: 14 }}>{status.message}</div>}
    <section className="section card"><h2>公开演示数据</h2><p className="muted">开发和截图使用完全虚构的数据，不包含私人 seed 中的体重、伤腕背景或真实训练。</p><button className="button ghost" onClick={loadDemo}><FlaskConical size={17}/> 加载演示数据</button></section>
    <section className="section card danger-zone"><h2>清除本地私人数据</h2><p className="muted">保留内置动作库，但移除档案、训练、恢复记录和 PR。无法撤销。</p><button className="button danger" onClick={clear}><Trash2 size={17}/> 清空数据库</button></section>
  </main>
}
