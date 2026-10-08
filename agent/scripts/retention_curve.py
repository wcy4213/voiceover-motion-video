#!/usr/bin/env python3
"""retention_curve.py — 完播曲线诊断：开场漏 / 断崖 / 匀速流失，三类问题三种修法

思路移植自 Jakeschincariol/youtube-agent-skill 的 yt-retention/retention.py（MIT），改为本管线格式：
  - 曲线：任意平台导出的两列 CSV（时间点 秒 或 百分比, 留存%）。抖音/小红书/视频号后台、YouTube Studio 都行；
    后台不给导出时手抄 10–20 个点也能用。
  - 口播：transcribe_ts.py 的 transcript.json（[{start,end,text}]），可选
  - 画面：pace_check.py --json 的报告，可选 —— 断崖附近视觉事件密度一起报，用来验证"画面停 → 人走"

用法：
  python3 retention_curve.py curve.csv --duration 306 [--transcript transcript.json] [--pace pace.json] [--json]

三类问题（修法不同，别混）：
  开场漏 HOOK   前 5 秒 / 前 25 秒流失（抖音 2 秒分水岭、25 秒结算线）→ 改第一句和 frame 0，别动中段
  断崖 CLIFF    某个时刻陡降 → 那一刻在说什么/画面在干什么：没预告的转场、长铺垫、画面空窗
  匀速 SLIDE    中段平稳流失 → 节奏问题，**删**中段，不是重写
"""
import argparse, csv, json, os


def load_curve(path):
    rows = []
    with open(path, newline='', encoding='utf-8-sig', errors='replace') as fh:
        for r in csv.reader(fh):
            vals = []
            for c in r:
                c = c.strip().replace('%', '').replace(',', '')
                try:
                    vals.append(float(c))
                except ValueError:
                    pass
            if len(vals) >= 2:
                rows.append((vals[0], vals[1]))
    rows.sort()
    return rows


def at_value(rows, t):
    """线性插值：t 秒时的留存"""
    if t <= rows[0][0]:
        return rows[0][1]
    for (x0, y0), (x1, y1) in zip(rows, rows[1:]):
        if x0 <= t <= x1:
            return y0 + (y1 - y0) * (t - x0) / ((x1 - x0) or 1)
    return rows[-1][1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('curve')
    ap.add_argument('--duration', type=float, help='成片秒数（曲线横轴是百分比时必填）')
    ap.add_argument('--transcript')
    ap.add_argument('--pace')
    ap.add_argument('--top', type=int, default=5)
    ap.add_argument('--json', action='store_true')
    a = ap.parse_args()

    rows = load_curve(a.curve)
    if len(rows) < 6:
        raise SystemExit('曲线点太少（<6），至少给 6 个 (时间, 留存%) 点')
    pct_axis = max(x for x, _ in rows) <= 100.5 and a.duration and a.duration > 100.5
    if pct_axis:
        rows = [(x / 100.0 * a.duration, y) for x, y in rows]
    dur = a.duration or rows[-1][0]
    start = rows[0][1] or 100.0

    hook5 = start - at_value(rows, 5)
    hook25 = start - at_value(rows, 25)
    drops = []
    for (x0, y0), (x1, y1) in zip(rows, rows[1:]):
        span = (x1 - x0) or 1
        drops.append(((y0 - y1) / span, x0, x1, y0 - y1))
    mid = [r for r, x0, _, _ in drops if 25 <= x0 <= dur * 0.9]
    slide = sum(mid) / len(mid) if mid else 0.0
    cliffs = sorted([d for d in drops if d[1] >= 3 and d[0] > max(slide * 2.5, 0.05)], reverse=True)[: a.top]

    cues = []
    if a.transcript and os.path.exists(a.transcript):
        data = json.load(open(a.transcript))
        data = data.get('segments', data) if isinstance(data, dict) else data
        for c in data:
            s = c.get('start', c.get('s')); e = c.get('end', c.get('e')); t = c.get('text', '')
            if s is not None and e is not None:
                cues.append((float(s), float(e), t))
    pace = json.load(open(a.pace)) if a.pace and os.path.exists(a.pace) else None

    out_cliffs = []
    for rate, x0, x1, lost in sorted(cliffs, key=lambda d: d[1]):
        said = ' '.join(t for s, e, t in cues if s <= x1 + 3 and e >= x0 - 3)[:120] if cues else ''
        vis = None
        if pace:
            spans = [sp for sp in pace.get('static_spans', []) if sp[0] <= x1 and sp[1] >= x0 - 3]
            win = pace.get('density_per_5s', [])
            k = int(x0 // 5)
            vis = {'events_in_5s_window': win[k] if k < len(win) else None, 'overlapping_static_spans': spans}
        out_cliffs.append({'from_s': round(x0, 1), 'to_s': round(x1, 1), 'lost_pct': round(lost, 2), 'rate_per_s': round(rate, 3), 'said': said, 'visual': vis})

    report = {'curve': a.curve, 'duration': dur, 'start': start, 'end': rows[-1][1],
              'hook_leak_5s': round(hook5, 1), 'hook_leak_25s': round(hook25, 1),
              'slide_per_s': round(slide, 3), 'cliffs': out_cliffs}
    if a.json:
        print(json.dumps(report, ensure_ascii=False, indent=1))
        return

    print(f'\n▶ {a.curve}  {len(rows)} 点  {start:.1f}% → {rows[-1][1]:.1f}%  （时长 {dur:.0f}s）\n')
    v5 = '健康' if hook5 < 35 else '漏' if hook5 < 55 else '严重'
    print(f'  开场漏  前 5s 流失 {hook5:.1f}%（{v5}）· 前 25s 流失 {hook25:.1f}%')
    print('          → 先改第一句（主角+结论+数字）和 frame 0/开场动效，再看别的\n')
    print('  断崖    观众真正离开的时刻：')
    if not out_cliffs:
        print('          无明显断崖 —— 流失全是匀速，问题在节奏不在某一刻')
    for c in out_cliffs:
        line = f'    -{c["lost_pct"]:5.1f}%  {c["from_s"]:6.1f}s→{c["to_s"]:6.1f}s'
        if c['said']:
            line += f'  「{c["said"]}」'
        print(line)
        if c['visual']:
            ev = c['visual']['events_in_5s_window']
            st = c['visual']['overlapping_static_spans']
            print(f'             画面：该 5s 窗 {ev} 个视觉事件' + (f'，与静止段 {st} 重叠 ← 画面空窗嫌疑' if st else ''))
    print(f'\n  匀速    中段每秒流失 {slide:.3f}%')
    print('          → 匀速流失是节奏问题：删中段、提前最好的那一段，不是重写\n')


if __name__ == '__main__':
    main()
