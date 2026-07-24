#!/usr/bin/env python3
"""broll_fetch.py — B-roll 素材搜索/下载/防复用台账

素材池: $BROLL_POOL 或 ~/broll-pool/ 下的 {videos,images}/ + ledger.json 台账

子命令:
  search <query> [--source pexels|pixabay|openverse|youtube|all] [--portrait] [-n N]
  fetch  <source:id> [--query q]        # 下载图库素材入池, 如 pexels:12345
  yt     <url> [--section MM:SS-MM:SS]  # yt-dlp 下载 YouTube/Vimeo/X 等(原流无水印)
  used   <asset-id>... --video <slug>   # 标记素材已用于某期视频
  list   [--unused] [--grep 关键词]      # 查看素材池

API key(仅 pexels/pixabay 需要, 免费注册):
  env PEXELS_API_KEY / PIXABAY_API_KEY, 或钥匙串:
  security add-generic-password -s pexels-api-key  -a "$USER" -w '<KEY>'
  security add-generic-password -s pixabay-api-key -a "$USER" -w '<KEY>'
合规提醒: Pexels 素材成片简介需带一句素材来源 Pexels; openverse 结果注意
license 字段, by/by-sa 需在简介署名作者; 只从源头拿无水印, 绝不抹他人水印。
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

def find_pool():
    env = os.environ.get("BROLL_POOL")
    if env:
        return Path(env).expanduser()
    legacy = Path.home() / "Desktop/ClaudeCode/broll-pool"
    return legacy if legacy.exists() else Path.home() / "broll-pool"


POOL = find_pool()
LEDGER = POOL / "ledger.json"
UA = "broll-fetch/1.0 (personal editing tool)"


def find_ytdlp():
    # 优先 3.11 下的新版(旧 3.9 版已被 YouTube 风控淘汰)
    for p in ("/Library/Frameworks/Python.framework/Versions/3.11/bin/yt-dlp",
              "/opt/homebrew/bin/yt-dlp"):
        if Path(p).exists():
            return p
    return shutil.which("yt-dlp")


def ytdlp_common_args(browser_cookies=None):
    """新版 yt-dlp 提 YouTube 需要 JS runtime(用 nvm node); 风控要 cookie 时加 --cookies-from-browser。"""
    args = []
    node_bins = sorted(Path.home().glob(".nvm/versions/node/*/bin/node"))
    if node_bins:
        args += ["--js-runtimes", f"node:{node_bins[-1]}"]
    if browser_cookies:
        args += ["--cookies-from-browser", browser_cookies]
    return args


def load_ledger():
    if LEDGER.exists():
        return json.loads(LEDGER.read_text())
    return {"assets": {}}


def save_ledger(ledger):
    POOL.mkdir(parents=True, exist_ok=True)
    LEDGER.write_text(json.dumps(ledger, ensure_ascii=False, indent=2))


def get_key(env_name, keychain_service):
    key = os.environ.get(env_name)
    if key:
        return key
    try:
        out = subprocess.run(
            ["security", "find-generic-password", "-s", keychain_service, "-w"],
            capture_output=True, text=True, timeout=10)
        if out.returncode == 0:
            return out.stdout.strip()
    except Exception:
        pass
    return None


def http_json(url, headers=None):
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def download(url, dest, headers=None):
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
        shutil.copyfileobj(r, f)
    return dest


def need_key(name, env, service, signup):
    print(f"[!] 缺 {name} API key。免费注册: {signup}")
    print(f"    然后 export {env}=<KEY> 或存钥匙串: security add-generic-password -s {service} -a \"$USER\" -w '<KEY>'")


# ---------- search ----------

def search_pexels(query, n, portrait):
    key = get_key("PEXELS_API_KEY", "pexels-api-key")
    if not key:
        need_key("Pexels", "PEXELS_API_KEY", "pexels-api-key", "https://www.pexels.com/api/")
        return
    params = {"query": query, "per_page": n}
    if portrait:
        params["orientation"] = "portrait"
    data = http_json("https://api.pexels.com/videos/search?" + urllib.parse.urlencode(params),
                     {"Authorization": key})
    for v in data.get("videos", []):
        best = max(v["video_files"], key=lambda f: f.get("width") or 0)
        print(f"pexels:{v['id']} | {v['duration']}s | {best['width']}x{best['height']} | {v['url']}")


def search_pixabay(query, n, portrait):
    key = get_key("PIXABAY_API_KEY", "pixabay-api-key")
    if not key:
        need_key("Pixabay", "PIXABAY_API_KEY", "pixabay-api-key", "https://pixabay.com/api/docs/")
        return
    params = {"key": key, "q": query, "per_page": max(n, 3)}
    data = http_json("https://pixabay.com/api/videos/?" + urllib.parse.urlencode(params))
    shown = 0
    for v in data.get("hits", []):
        big = v["videos"].get("large") or v["videos"]["medium"]
        if portrait and big["width"] >= big["height"]:
            continue
        print(f"pixabay:{v['id']} | {v['duration']}s | {big['width']}x{big['height']} | {v['tags']} | {v['pageURL']}")
        shown += 1
        if shown >= n:
            break


def search_openverse(query, n):
    params = {"q": query, "license_type": "commercial", "page_size": n}
    data = http_json("https://api.openverse.org/v1/images/?" + urllib.parse.urlencode(params))
    for r in data.get("results", []):
        creator = (r.get("creator") or "?").strip()
        print(f"openverse:{r['id']} | {r.get('width')}x{r.get('height')} | license={r['license']}"
              f" | by {creator} | {r.get('foreign_landing_url') or r['url']}")


def search_youtube(query, n):
    ytdlp = find_ytdlp()
    if not ytdlp:
        print("[!] 未找到 yt-dlp (pip install yt-dlp)")
        return
    cmd = [ytdlp, f"ytsearch{n}:{query}", "--flat-playlist", *ytdlp_common_args(),
           "--print", "%(url)s | %(duration_string)s | %(channel)s | %(title)s"]
    subprocess.run(cmd)


# ---------- fetch ----------

def add_asset(ledger, asset_id, entry):
    if asset_id in ledger["assets"]:
        old = ledger["assets"][asset_id]
        used = old.get("used_in") or []
        print(f"[!] {asset_id} 已在素材池: {old['file']}")
        if used:
            print(f"[!!] 注意: 该素材已用于 {used} — 跨期原样复用会撞画面指纹, 必须换裁切/运镜")
        return old
    entry.setdefault("used_in", [])
    entry["added"] = date.today().isoformat()
    ledger["assets"][asset_id] = entry
    save_ledger(ledger)
    print(f"[ok] {asset_id} -> {entry['file']}")
    return entry


def fetch(source_id, query):
    ledger = load_ledger()
    source, _, sid = source_id.partition(":")
    if source == "pexels":
        key = get_key("PEXELS_API_KEY", "pexels-api-key")
        if not key:
            return need_key("Pexels", "PEXELS_API_KEY", "pexels-api-key", "https://www.pexels.com/api/")
        v = http_json(f"https://api.pexels.com/videos/videos/{sid}", {"Authorization": key})
        best = max(v["video_files"], key=lambda f: f.get("width") or 0)
        dest = POOL / "videos" / f"pexels_{sid}.mp4"
        download(best["link"], dest)
        add_asset(ledger, source_id, {
            "source": "pexels", "query": query, "file": str(dest),
            "url": v["url"], "license": "Pexels(免署名,简介注明来源Pexels)",
            "duration": v.get("duration"), "resolution": f"{best['width']}x{best['height']}"})
    elif source == "pixabay":
        key = get_key("PIXABAY_API_KEY", "pixabay-api-key")
        if not key:
            return need_key("Pixabay", "PIXABAY_API_KEY", "pixabay-api-key", "https://pixabay.com/api/docs/")
        data = http_json(f"https://pixabay.com/api/videos/?key={key}&id={sid}")
        if not data.get("hits"):
            return print(f"[!] pixabay id {sid} 未找到")
        v = data["hits"][0]
        big = v["videos"].get("large") or v["videos"]["medium"]
        dest = POOL / "videos" / f"pixabay_{sid}.mp4"
        download(big["url"], dest)
        add_asset(ledger, source_id, {
            "source": "pixabay", "query": query, "file": str(dest),
            "url": v["pageURL"], "license": "Pixabay Content License(免署名)",
            "duration": v.get("duration"), "resolution": f"{big['width']}x{big['height']}"})
    elif source == "openverse":
        r = http_json(f"https://api.openverse.org/v1/images/{sid}/")
        ext = (r.get("filetype") or "jpg").lstrip(".")
        dest = POOL / "images" / f"openverse_{sid[:8]}.{ext}"
        download(r["url"], dest)
        lic = r["license"]
        note = "" if lic in ("cc0", "pdm") else f" 需署名: {r.get('creator')} ({lic.upper()})"
        add_asset(ledger, source_id, {
            "source": "openverse", "query": query, "file": str(dest),
            "url": r.get("foreign_landing_url") or r["url"],
            "license": f"{lic}{note}", "creator": r.get("creator"),
            "resolution": f"{r.get('width')}x{r.get('height')}"})
        if note:
            print(f"[!] 该图 license={lic}, 成片简介需署名作者: {r.get('creator')}")
    else:
        print(f"[!] 不认识的来源 {source} (支持 pexels/pixabay/openverse; 视频站用 yt 子命令)")


def fetch_yt(url, section, title, browser_cookies=None):
    ytdlp = find_ytdlp()
    if not ytdlp:
        return print("[!] 未找到 yt-dlp")
    outdir = POOL / "videos"
    outdir.mkdir(parents=True, exist_ok=True)
    suffix = f"_{section.replace(':', '').replace('-', '_')}" if section else ""
    tmpl = str(outdir / f"%(extractor_key)s_%(id)s{suffix}.%(ext)s")
    cmd = [ytdlp, "-f", "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b",
           "--merge-output-format", "mp4", "-o", tmpl, "--no-playlist",
           "--print", "after_move:filepath", "--no-simulate",
           *ytdlp_common_args(browser_cookies), url]
    if section:
        cmd += ["--download-sections", f"*{section}", "--force-keyframes-at-cuts"]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-2000:])
        if "Sign in to confirm" in r.stderr and not browser_cookies:
            print("[提示] YouTube 风控要求登录态, 重试加 --browser-cookies chrome")
            print("       (首次会弹 macOS 钥匙串授权 'Chrome Safe Storage', 点允许; 建议先退出 Chrome)")
        return print("[!] 下载失败")
    filepath = r.stdout.strip().splitlines()[-1]
    ledger = load_ledger()
    stem = Path(filepath).stem
    add_asset(ledger, f"yt:{stem}", {
        "source": "yt-dlp", "query": title or "", "file": filepath, "url": url,
        "license": "版权注意: 官方PD源(Fed/国会)可商用; 公司keynote仅短引用+解说为主",
        "section": section or "full"})


# ---------- used / list ----------

def mark_used(asset_ids, video_slug):
    ledger = load_ledger()
    for aid in asset_ids:
        a = ledger["assets"].get(aid)
        if not a:
            print(f"[!] 台账里没有 {aid}")
            continue
        if video_slug not in a["used_in"]:
            a["used_in"].append(video_slug)
        print(f"[ok] {aid} 已标记用于 {video_slug} (历史: {a['used_in']})")
    save_ledger(ledger)


def list_assets(unused, grep):
    ledger = load_ledger()
    if not ledger["assets"]:
        return print("素材池为空")
    for aid, a in ledger["assets"].items():
        if unused and a.get("used_in"):
            continue
        line = f"{aid} | {a.get('query', '')} | {a.get('resolution', a.get('section', ''))} | 用过: {a.get('used_in') or '无'} | {a['file']}"
        if grep and grep.lower() not in line.lower():
            continue
        print(line)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("search", help="搜素材")
    s.add_argument("query")
    s.add_argument("--source", default="all", choices=["pexels", "pixabay", "openverse", "youtube", "all"])
    s.add_argument("--portrait", action="store_true", help="只要竖屏")
    s.add_argument("-n", type=int, default=8)

    f = sub.add_parser("fetch", help="下载图库素材入池")
    f.add_argument("source_id", help="如 pexels:12345 / pixabay:678 / openverse:<uuid>")
    f.add_argument("--query", default="", help="记录当时的搜索词")

    y = sub.add_parser("yt", help="yt-dlp 下载视频站素材(YouTube/Vimeo/X...)")
    y.add_argument("url")
    y.add_argument("--section", help="只下载区间, 如 12:30-13:10")
    y.add_argument("--title", default="", help="备注")
    y.add_argument("--browser-cookies", metavar="BROWSER",
                   help="YouTube 遇 bot 风控时用, 如 chrome (读你自己浏览器的登录态)")

    u = sub.add_parser("used", help="标记素材已用于某期")
    u.add_argument("asset_ids", nargs="+")
    u.add_argument("--video", required=True, help="视频 slug, 如 googleq2")

    l = sub.add_parser("list", help="查看素材池")
    l.add_argument("--unused", action="store_true")
    l.add_argument("--grep", default="")

    a = p.parse_args()
    if a.cmd == "search":
        srcs = ["pexels", "pixabay", "openverse", "youtube"] if a.source == "all" else [a.source]
        for src in srcs:
            print(f"—— {src} ——")
            if src == "pexels":
                search_pexels(a.query, a.n, a.portrait)
            elif src == "pixabay":
                search_pixabay(a.query, a.n, a.portrait)
            elif src == "openverse":
                search_openverse(a.query, a.n)
            elif src == "youtube":
                search_youtube(a.query, a.n)
    elif a.cmd == "fetch":
        fetch(a.source_id, a.query)
    elif a.cmd == "yt":
        fetch_yt(a.url, a.section, a.title, a.browser_cookies)
    elif a.cmd == "used":
        mark_used(a.asset_ids, a.video)
    elif a.cmd == "list":
        list_assets(a.unused, a.grep)


if __name__ == "__main__":
    main()
