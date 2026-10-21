# AI 日报 每日更新流程
1. 收集（带工具的 agent）：X 工具 search_posts_all（四家大厂官方号+知名 AI 账号，近 24-48h，含 public_metrics）、search_news、WebSearch/WebFetch（Filecoin、各家官方博客）。
2. 可选第二来源：`python3 gemini_crosscheck.py` → gemini_candidates.json（仅保留 URL 实测 200 的条目；Gemini 不可用时自动跳过）。
3. 按 site/data/2026-10-21.json 的结构写 draft.json（中文摘要；每条必须有真实链接，不得编造）。
4. `python3 generate.py draft.json`（校验链接、计算热度=赞+评+转+引并排序 Top10、写 DATE.json/latest.json/index.json，时间为北京时间）
5. `./publish.sh`（更新 SW 缓存版本、commit、push 到 GitHub Pages）
