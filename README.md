# AI 日报 每日更新流程
板块：大厂动态（OpenAI / Anthropic / xAI / Google / Grok Bot 五个来源）、X 热帖 Top10、Filecoin、每日金融市场简报（规范见 FINANCE_SPEC.md）。

1. 收集（带工具的 agent）
   - X 工具 search_posts_all（官方号+知名 AI 账号，近 24–48h，含 public_metrics）、search_news；WebSearch/WebFetch。
   - Grok Bot：查 https://x.ai/changelog/bot、X 上官方/员工帖子；48h 内无新功能则写一条 title「今日无更新」并附 changelog 链接。
   - 金融：美股/美债/美元/黄金/布伦特取 Yahoo Finance chart API（query1.finance.yahoo.com/v8/finance/chart/^GSPC 等）；
     BTC/ETH/FIL 只用 CoinGecko simple/price 同一批快照；新闻用 WSJ/AP/CNBC/Investrade；ETF 流向用 Farside；日历用官方/Investrade，ET 转北京时间。
     先读前一天 JSON 的 finance.groups[].items[].next_check 写「昨日验证」（generate.py 会打印出来）。
2. 第二来源（Gemini 只走 Antigravity 订阅，绝不用 GEMINI_API_KEY）：
   `python3 gemini_crosscheck.py` → 内部执行 `HOME=/home/box/agy-home agy -p "..." </dev/null`，只保留 URL 实测 200 的条目 → gemini_candidates.json
3. 按 site/data/2026-10-21.json 的结构写 draft.json（中文；每条真实链接；不得编造，查不到标「未核实」）。
4. `python3 generate.py draft.json`（校验链接与金融规范、计算 X 热度并排序、写 DATE.json / latest.json / index.json）
5. `./publish.sh`（刷新 SW 缓存版本、commit、push 到 GitHub Pages）
