# Formlog

Formlog 是一个私人、离线优先、AI 可迁移的力量训练记录 PWA。它专注于三件事：快速可靠地留下原始训练记录、看清力量与训练量趋势、把完整训练状态迁移给任何 AI。

它没有账号、后端、遥测、广告、社交、streak、饮食追踪或内置聊天。手动训练记录永远是 source of truth。

## 本地开发

要求 Node.js 22+。

```bash
npm install
npm run dev
```

质量检查：

```bash
npm run lint
npm run test
npm run build
npm run preview
```

## 使用方式

1. 在「训练」中选择空白训练或模板。
   - 默认记录今天；补记时可先选择“昨天”或任意过去日期。
2. 练完一个动作后添加它，一次录入重量、次数和可选 RPE。
3. 「完成」后在历史和进度中查看原始组数、工作组、训练容量与透明的 Epley 估算 1RM。
4. 在「备份与恢复」中定期下载 `fitness-log-backup.json`。
5. 在「AI 复盘与迁移」中生成单文件 `coach_update.md`，直接复制到长期训练对话；换 AI 时再生成完整 ZIP。
6. 把 AI 给出的阶段计划保存到「当前阶段计划」，后续复盘会自动带上计划和执行记录。

动作搜索同时匹配中文、英文 canonical name 和 alias。哑铃的 `per_hand`、器械的 `machine_stack`、自重与辅助自重均保留明确语义；单侧动作可注明每侧次数，避免明显错误的容量统计。

## PWA 与离线

Vite PWA 插件在生产构建中生成 manifest 与 service worker。首次在线加载生产版本后，app shell 会被缓存；安装到 iPhone 主屏幕或桌面浏览器后，可以离线打开、查看历史和记录训练。iPhone 底部导航包含 `safe-area-inset-bottom`。

开发模式不代表完整离线行为。请用 `npm run build && npm run preview` 验证 service worker，并在浏览器开发者工具中切换 Offline。

## 数据模型与存储

训练数据位于浏览器 IndexedDB，由 Dexie 管理。目前数据库版本为 2，核心实体包括：

- `AthleteProfile`, `Goal`, `Exercise`
- `Workout`, `WorkoutExercise`, `WorkoutSet`
- `BodyMeasurement`, `RecoveryNote`, `ActivitySession`
- `HistoricalPR`, `WorkoutTemplate`

原始组数是唯一事实来源。e1RM、容量、每周肌群工作组和当前 PR 都可以从原始数据重新计算。`localStorage` 不保存训练数据。

## 备份与恢复

JSON 备份使用 `schemaVersion: 1`，包含档案、目标、动作、训练、组数、测量、活动、恢复笔记、历史 PR、模板和阶段计划。导入前使用 Zod 完整校验；支持：

- **Replace**：完整替换数据库，适用于灾难恢复。
- **Merge**：按稳定 ID 合并，适合把私人 seed 加到基础动作库。

自动测试覆盖 export → clear IndexedDB → import → equality 的关键恢复路径，以及旧 schema 迁移。

## 私人数据与演示数据

公开源码只包含 `src/data/demoSeed.ts` 中完全虚构的演示数据。真实私人 seed 位于被 Git 忽略的 `private-data/athlete.seed.json`，不得强制添加到 Git，也不得复制进 `src/` 或 `public/`。

首次私人设置：打开「备份与恢复」，选择 **合并**，导入 `private-data/athlete.seed.json`。之后导出一份新的完整备份并存放在安全位置。

## AI Export

生成全部在浏览器本地完成，不调用任何 AI 或网络 API：

- `coach_update.md`：适合在 iPhone 上复制/分享的阶段复盘，包含近期训练量、主项表现、恢复和当前计划
- `athlete_profile.md`：长期背景、偏好、训练考量、历史 PR
- `AI_CONTEXT.md`：当前体重、目标、主项状态、近期量与恢复
- `recent_sessions.md`：最近 10 次完整训练
- `sets.csv`, `workouts.csv`, `exercises.csv`：可迁移的结构化原始数据
- `ai_handoff_prompt.md`：交给新 AI 的使用说明

## 隐私与仓库策略

推荐分离：

- 公共 app 仓库：源码、测试、文档和 synthetic demo。
- 私人 data 仓库：从 app 导出的备份；必须设为 Private。

不要把 `private-data/`、导出的真实 JSON/CSV/Markdown 或包含私人信息的截图提交到公共仓库。应用默认不向任何服务器发送个人数据。

## GitHub Pages 部署

项目使用 `HashRouter` 与相对 `base: './'`，避免 GitHub Pages SPA fallback 问题。`.github/workflows/deploy.yml` 会在 `main` 分支 push 时依次 lint、test、build 并部署 `dist/`。

在 GitHub 仓库 Settings → Pages 中把 Source 设置为 **GitHub Actions**。部署本身不包含 `private-data/`。

### iPhone 日常流程

1. 用 Safari 打开 Pages 地址，选择「分享 → 添加到主屏幕」。
2. 首次导入电脑导出的完整 JSON；以后以 iPhone 数据为主。
3. 训练完成后可在详情页把带日期的备份保存到 iCloud Drive。
4. 阶段结束后生成 `coach_update.md`，复制到 ChatGPT Project 或通过 iOS 分享菜单发送。
5. 将 AI 的新计划粘贴回「当前阶段计划」。

训练数据保存在 iPhone 对应站点的 IndexedDB 中，不会自动上传到 GitHub Pages。iCloud JSON 是灾难恢复备份，GitHub Pages 只托管公开应用代码。

实际训练日期可以在新建训练前选择，也可以在训练编辑页面中修改。`date` 表示训练发生日期，`createdAt` 继续保留实际录入时间，因此补记不会破坏数据来源信息。

## 路线图（非 V1）

- 可选 `GitHubBackupProvider`，不改变本地 source of truth
- Apple Health / HealthKit 外部数据 provider
- 需要 HealthKit 时的轻量 iOS companion
- 更多可解释的 PR 与趋势视图

明确不在 V1：云后端、账号、订阅、社交、营养追踪、AI 自动计划、HealthKit、复杂 readiness、推送和训练计时器。
