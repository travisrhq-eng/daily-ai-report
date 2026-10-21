# AI 日报 每日更新流程
板块：大厂动态（OpenAI / Anthropic / xAI / Google / Grok Bot）、X 热帖 Top10、Filecoin、金融简报（FINANCE_SPEC.md）、Falcon。
总标准：**新、准、无遗漏、不能有疑**。generate.py 强制校验，任何违规直接构建失败。

## 1. 收集（带工具的 agent）
- X：x 命名空间 search_posts_all（post.fields=public_metrics,created_at；expansions=author_id；限 30 次/分、25 条/次）。
- 大厂：官方号 + 知名 AI 账号，近 72h；Grok Bot 查 https://x.ai/changelog/bot，48h 无新功能写一条 title「今日无更新」(status_card:true)。
- Falcon：query `("Falcon 9" OR "Falcon Heavy" OR Falcon9 OR (falcon SpaceX)) -is:retweet -is:reply`，start_time=现在−48h，sort_order=relevancy，取 2–3 页；只保留正文含 falcon 且指 SpaceX 火箭的帖子；按 赞+评+转+引 排序取前 10，不足 10 条在 meta.falcon.note 注明实际数量；meta.falcon.note 写明本期采用的 Falcon 含义与排除的含义。
- 金融：见 FINANCE_SPEC.md。
## 2. 第二来源交叉核对（Gemini 只走 agy 订阅，绝不用 GEMINI_API_KEY）
- `python3 gemini_crosscheck.py`（补漏候选）。
- 关键数字/事实逐条核对：`env -u GEMINI_API_KEY HOME=/home/box/agy-home agy -p "<claims 列表，要求 JSON {id,status,url,note}>" </dev/null`；vertexaisearch 跳转链接用 `curl -w %{redirect_url}` 还原真实 URL。
- 结果写入每条的 crosscheck：`{"status":"已交叉核对","by","source","url"}` / `{"status":"单一来源","note"}` / `{"status":"冲突","values":[{value,source,url}≥2],"reason"}`。X 互动数为 X API 一手计数，标单一来源。
## 3. 写 draft.json（结构同 site/data/最新.json）
每条列表项必填：source_url|url、published_at（YYYY-MM-DD HH:MM，X 帖由 created_at 转北京时间）、fetched_at（YYYY-MM-DD HH:MM）、grade（官方一手|主流媒体|专业数据平台|社媒传闻）、crosscheck。
未证实条目加 unverified:true + unverified_reason。
每个板块 meta.<板块>：as_of（数据截至，北京时间）、basis（排序依据）、missing（本期缺失 [{item,reason}]，无则 []）、note（可选）。
## 4. 写作规则（构建会检查）
- 禁用模糊词：大约/约/可能/据悉/据称/据报道/据传/或许/大概/左右/似乎/疑似/估计/有望/或将/也许（unverified 条目豁免并移入待验证）。
- 推断句以「判断：」开头且须含具体数字；每个数字写清来源与时间；日期一律完整 YYYY-MM-DD。
- 自动处理：发布超 72h、无完整日期、未证实 → 移入「待验证」块，不进正文；大厂每家最多 3 条，超出进「同公司更多条目」；五家必须齐全。
## 5. 构建与发布
`python3 generate.py draft.json && ./publish.sh`（校验 → 写 DATE.json/latest.json/index.json → 刷新 SW 缓存 → push GitHub Pages）。
