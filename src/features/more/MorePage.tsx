import { Activity, ChevronRight, ClipboardList, Database, Download, Dumbbell, Settings2, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui'

const items = [
  { to: '/profile', title: '个人档案与目标', body: '背景、目标、训练偏好与体重', icon: UserRound },
  { to: '/exercises', title: '动作库', body: '中英名称、重量语义与自定义动作', icon: Dumbbell },
  { to: '/recovery', title: '恢复与活动', body: '可选恢复笔记、篮球与有氧活动', icon: Activity },
  { to: '/training-plan', title: '当前阶段计划', body: '保存 AI 给出的计划，复盘时自动带上', icon: ClipboardList },
  { to: '/ai-export', title: 'AI 复盘与迁移', body: '复制阶段复盘，或生成完整 handoff', icon: Download },
  { to: '/backup', title: '备份与恢复', body: '版本化 JSON，本地导入与导出', icon: Database },
]

export function MorePage() {
  return <main><PageHeader eyebrow="你的数据，你做主" title="更多" /><div className="menu-grid">{items.map(({ to, title, body, icon: Icon }) => <Link className="menu-card" to={to} key={to}><Icon size={22} /><div><strong>{title}</strong><span>{body}</span></div><ChevronRight size={18} className="muted" /></Link>)}</div><section className="section card"><div className="card-header"><div><p className="eyebrow">Privacy model</p><h2>设备优先，没有账号。</h2></div><Settings2 className="muted" /></div><p className="muted" style={{ marginBottom: 0, lineHeight: 1.6 }}>训练数据保存在浏览器 IndexedDB。应用没有分析、广告、遥测或 AI API 调用。每周把带日期的 JSON 保存到 iCloud Drive，手机丢失或网站数据被清理时即可恢复。</p></section></main>
}
