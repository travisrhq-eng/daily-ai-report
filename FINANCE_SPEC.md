# 每日金融市场简报 规范（sections.finance）
JSON 结构：
{
 "title":"每日金融市场简报｜YYYY-MM-DD",
 "cutoff":"YYYY-MM-DD HH:mm（北京时间）",
 "cutoff_note":"说明：美股/美债为最近收盘，外汇/商品为盘中，加密为单一平台同批快照",
 "missing":[{"item","reason"}],                       # 本期缺失，放在资料截止之后
 "yesterday_check":"1–2 句；读取前一天 JSON 的 next_check；无则 null（不显示）",
 "three_lines":[{"conclusion","support"}] x3,        # 今日三句话
 "snapshot":[{"asset","value","change","time","status":"收盘|盘中|快照|未核实","source","source_url","reason"?}],
   # 资产固定 9 个：标普500、纳斯达克综合指数、美元指数 DXY、美国10年期国债收益率、COMEX 黄金、布伦特原油、BTC、ETH、FIL
   # 加密三项须来自同一平台同一批快照（如 CoinGecko）
 "groups":[{"name":"全球金融市场|加密二级市场","items":[{
    "no","headline","facts","plain","affects",
    "pricing":"已定价|部分定价|已有反应但程度不明|无法判断","pricing_evidence",
    "next_check","risks",
    "sources":[{"outlet","title","url","date"}],
    "grade":"官方一手|主流媒体|专业数据平台|社媒传闻"}]}],   # 共约 5–6 条，编号连续
 "events":[{"time_bj","event","watch"}],"events_source":[{"outlet","title","url"}],  # 未来24—72小时
 "footer":"以上仅作信息参考。"
}
规则：推断以「判断：」开头，纯事实不加；百分比两位小数，负号用「−」；千分位；时间一律北京时间；
所有数字必须来自已抓取来源，否则标「未核实」并写原因。Filecoin 新闻只放 Filecoin 板块，这里只写 FIL 价格/供应。
样式：沿用站点黑白灰，标签为灰色纯文字，涨跌不着色。

## 2026-10-21 起新增硬性规则（generate.py 校验）
- cutoff、snapshot.time、events.time_bj 一律 YYYY-MM-DD HH:MM（北京时间）；sources[].date 完整 YYYY-MM-DD。
- change 单位与窗口分开写：百分比 `+0.28%（较前收）`、收益率 `−1.9 bp（较前收）`、加密 `+0.85%（24h）`；负号「−」；页面用灰色 ▲▼，不着色。
- 每行 snapshot 与每条 item 带 crosscheck（已交叉核对|单一来源|冲突）；第二来源走 Codex（见 README 第 2 节）；冲突须并列两个值+来源+差异原因。
- risks 必须以「判断：」开头且引用具体数字；全文禁用模糊词（见 README）。
- yesterday_check 留 null 时自动生成：读前一天 next_check；无前一天数据写「首期无昨日数据。」。
- meta.finance：as_of / basis / missing 必填。

## 2026-10-23 起新增规则
- 口径统一：同一资产全页只用一个合约/口径，以 snapshot 为准（黄金用 snapshot 里的 COMEX 主力合约，原油同理）。groups 里写涨跌幅时必须与 snapshot 同口径；确需引用其他合约（如近月合约结算价），同一句里写明合约月份，headline 不得使用与 snapshot 不同口径的数字。
- 冲突容差：两来源差值超过以下容差才标「冲突」，否则标「已交叉核对」并在 note 写差值——指数/股价/商品 0.30%；外汇与美元指数 0.10%；收益率 2 bp；加密 0.50%；资金流 5%。
- 核对状态一致：snapshot 与 groups 引用同一数字时，crosscheck.status 必须相同。
- 第二来源降级（Codex 不可用）按 README 第 2 节加 `"fallback":true`。
