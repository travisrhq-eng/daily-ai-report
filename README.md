# AI 日报 每日更新流程
板块：大厂动态（OpenAI / Anthropic / xAI / Google / Grok Bot）、X 热帖 Top10、Filecoin、金融简报（FINANCE_SPEC.md）、GitHub 工具。
总标准：**新、准、无遗漏、不能有疑**。generate.py 强制校验，任何违规直接构建失败。

## 1. 收集（带工具的 agent）
- X：x 命名空间 search_posts_all（post.fields=public_metrics,created_at；expansions=author_id；限 30 次/分、25 条/次）。
- 大厂：官方号 + 知名 AI 账号，近 72h；Grok Bot 查 https://x.ai/changelog/bot，48h 无新功能写一条 title「今日无更新」(status_card:true)。
- X 热帖 Top10：上期截止后的 AI/科技原创帖（不含转发与回复），按 赞+评+转+引 排序。入榜限制：
  - 已收进本期大厂动态的帖子（同一 URL）不入榜，名额顺延；
  - 同一作者最多 2 条；
  - 正文去掉链接和 @ 提及后少于 15 个字、或只是推广/转链接的帖子不入榜。
- Filecoin：近 72h 官方、开发团队、GitHub、媒体与 X 帖子；只收上期截止后的新内容，上期已报的不进正文。
- GitHub 工具：5 个与 AI 相关、近 90 天内有提交、未归档的仓库，每期覆盖不同用途；stars 与 last_push 由 GitHub API 实时读取；与历史推荐不重复。
- 状态卡（今日无更新）：status_card:true；summary 写明检查范围与最近一次版本/发帖日期；published_at 填抓取时间，页面不显示。
- 金融：见 FINANCE_SPEC.md。
## 2. 第二来源交叉核对（用 Codex；不再使用 Gemini / agy）
- 补漏候选与关键数字/事实逐条核对都交给 Codex（联网搜索）：`codex --search exec --skip-git-repo-check -s read-only -o crosscheck.json "<claims 列表，要求只输出 JSON 数组 [{id,status,url,note}]，url 必须是可打开的原始页面>" </dev/null`。参数以生成机上的 Codex 版本为准。gemini_crosscheck.py 与 agy 调用停用。
- 结果写入每条的 crosscheck：`{"status":"已交叉核对","by":"Codex","source","url"}` / `{"status":"单一来源","note"}` / `{"status":"冲突","values":[{value,source,url}≥2],"reason"}`。X 互动数为 X API 一手计数，标单一来源。
- Codex 不可用时：可改用 WebSearch 人工核对，但 crosscheck 必须加 `"fallback":true`，by 写明「WebSearch 人工核对」，页面显示「已核对·备用来源」；同时在该板块 meta.missing 记一条「Codex 第二来源核对」及不可用原因。
- 「冲突」只用于超出容差的差异（容差见 FINANCE_SPEC.md）；四舍五入、口径不同但差值在容差内的，标「已交叉核对」并在 note 写明差值。
- 同一个数字在页面不同位置出现时，核对状态必须一致。
## 3. 写 draft.json（结构同 site/data/最新.json）
每条列表项必填：source_url|url、published_at（YYYY-MM-DD HH:MM，X 帖由 created_at 转北京时间）、fetched_at（YYYY-MM-DD HH:MM）、grade（官方一手|主流媒体|专业数据平台|社媒传闻）、crosscheck。
未证实条目加 unverified:true + unverified_reason。
每个板块 meta.<板块>：as_of（数据截至，北京时间）、basis（排序依据）、missing（本期缺失 [{item,reason}]，无则 []）、note（可选）。
## 4. 写作规则（构建会检查）
- 禁用模糊词：大约/约/可能/据悉/据称/据报道/据传/或许/大概/左右/似乎/疑似/估计/有望/或将/也许（unverified 条目豁免并移入待验证）。
- 推断句以「判断：」开头且须含具体数字；每个数字写清来源与时间；日期一律完整 YYYY-MM-DD。
- 自动处理：发布超 72h、无完整日期、未证实 → 移入「待验证」块，不进正文；大厂每家最多 3 条，超出进「同公司更多条目」；五家必须齐全。
- 去重：大厂动态、Filecoin、X 热帖与上一期同 URL 的条目不进正文；X 热帖与本期大厂动态同 URL 的不入榜（见第 1 节）。页面也会给漏网的重复条目标「上期已报」/「见大厂动态」。
- 模糊词检查按词匹配，「合约」「约定」「预约」「节约」等含「约」的固定词不算违规。
## 5. 构建与发布
`python3 generate.py draft.json && ./publish.sh`（校验 → 写 DATE.json/latest.json/index.json → 刷新 SW 缓存 → push GitHub Pages）。
- publish.sh 推送前先 `git pull --rebase`：index.html、README 等页面文件也会在别处修改，不能用本地旧副本覆盖。
- 事后补充或修改历史某期：更新对应栏目的 meta.<板块>.as_of，并在该期顶层写 `revised_at`（ISO 时间）；页面会显示「补充于」。updated_at 保持原首发时间。
