import { useState } from 'react'
import { Bot, Check, Clipboard, Download, FileText, Share2 } from 'lucide-react'
import JSZip from 'jszip'
import { PageHeader } from '../../components/ui'
import { createBackup, downloadBlob, shareOrDownloadFile } from '../backup/backup'
import { generateAIHandoff, generateCoachUpdate, type AIExportFiles } from './generate'

export function AIExportPage() {
  const [files, setFiles] = useState<AIExportFiles>()
  const [selected, setSelected] = useState('AI_CONTEXT.md')
  const [coachUpdate, setCoachUpdate] = useState<string>()
  const [status, setStatus] = useState<string>()
  const generateReview = async () => { const output = generateCoachUpdate(await createBackup()); setCoachUpdate(output); setStatus(undefined) }
  const generate = async () => { const output = generateAIHandoff(await createBackup()); setFiles(output); setSelected('coach_update.md') }
  const download = async () => { if (!files) return; const zip = new JSZip(); Object.entries(files).forEach(([name, content]) => zip.file(name, content)); downloadBlob(await zip.generateAsync({ type: 'blob' }), 'formlog-ai-handoff.zip') }
  const copy = async () => { if (!coachUpdate) return; await navigator.clipboard.writeText(coachUpdate); setStatus('已复制，可以直接粘贴到长期训练对话。') }
  const share = async () => {
    if (!coachUpdate) return
    try {
      const result = await shareOrDownloadFile(new File([coachUpdate], 'coach_update.md', { type: 'text/markdown' }), 'Formlog 阶段复盘')
      setStatus(result === 'shared' ? '已打开 iOS 分享菜单。' : '阶段复盘已下载。')
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setStatus('分享未完成，请使用复制按钮。') }
  }
  return <main><PageHeader eyebrow="AI portable" title="AI Export" back />
    <section className="card hero-card"><Bot size={30} color="#d6ff62"/><h2 style={{ marginTop: 18 }}>让长期训练对话直接看懂现状。</h2><p className="muted">生成一个适合手机分享的阶段复盘：近期训练、训练量、恢复、主项目状态和当前计划会整理进同一个 Markdown。</p><button className="button" onClick={generateReview}><FileText size={18}/> 生成阶段复盘</button></section>
    {coachUpdate && <section className="section"><div className="section-header"><h2>coach_update.md</h2><span className="chip accent">仅在本机生成</span></div><div className="grid-2" style={{ marginBottom: 12 }}><button className="button" onClick={copy}><Clipboard size={17}/> 复制给 AI</button><button className="button secondary" onClick={share}><Share2 size={17}/> 分享 / 存到文件</button></div>{status && <div className="notice success" style={{ marginBottom: 12 }}><Check size={15}/> {status}</div>}<pre className="code-preview">{coachUpdate}</pre><p className="caption" style={{ marginTop: 12 }}>推荐粘贴到 ChatGPT 的长期训练 Project。分享前可先快速浏览内容。</p></section>}
    <section className="section card"><div className="section-header"><div><h2>完整跨 AI 迁移包</h2><p className="muted" style={{ margin: 0 }}>换 AI 或做长期归档时使用。</p></div>{files && <button className="button small" onClick={download}><Download size={16}/> 下载 ZIP</button>}</div><button className="button secondary full" onClick={generate}><FileText size={18}/> 生成完整 Handoff</button>{files && <><div className="chip-row" style={{ margin: '16px 0 12px' }}>{Object.keys(files).map((name) => <button key={name} className={`chip ${selected === name ? 'accent' : ''}`} onClick={() => setSelected(name)}>{name}</button>)}</div><pre className="code-preview">{files[selected]}</pre></>}</section>
    <section className="section card"><h2>阶段复盘包含</h2><div className="stack">{['运动背景、当前目标与训练考量','最近四周工作组与主项表现','最近 10 次训练的完整组数与 RPE','恢复和腕部反馈','已保存的当前阶段计划与给 AI 的任务'].map((item) => <div className="row-between" key={item}><span className="muted">{item}</span><span className="chip accent">✓</span></div>)}</div></section>
  </main>
}
