from __future__ import annotations

from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_site"
DISCORD_URL = "https://discord.gg/UvkevzwuWR"

PUBLIC_FILES = [
    "index.html",
    "style.css",
    "script.js",
    "404.html",
    "robots.txt",
    "sitemap.xml",
    ".nojekyll",
    "datenschutz/index.html",
    "nutzungsbedingungen/index.html",
]
PUBLIC_ASSETS = ["assets/nfl-mark.svg"]

SECRET_PATTERNS = [
    re.compile(r"DISCORD_BOT_TOKEN", re.I),
    re.compile(r"DISCORD_CLIENT_SECRET", re.I),
    re.compile(r"SESSION_SECRET", re.I),
    re.compile(r"client_secret", re.I),
    re.compile(r"BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY", re.I),
]
MIXED_CONTENT = re.compile(r'(?:href|src)=["\']http://|url\([^)]*http://', re.I)
LEGACY_MARKERS = [
    re.compile(r"VELTRIX"),
    re.compile(r"VELTRIX-Setup"),
    re.compile(r"discord\.gg/(?:nzP6Hq2n2M|5WteV2B68C)"),
]


def copy_source() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    for rel in PUBLIC_FILES:
        source = ROOT / rel
        if not source.exists():
            raise SystemExit(f"Missing public source file: {rel}")
        target = OUT / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)

    for rel in PUBLIC_ASSETS:
        source = ROOT / rel
        if not source.exists():
            raise SystemExit(f"Missing public asset: {rel}")
        target = OUT / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)


def text_files() -> list[Path]:
    return [p for p in OUT.rglob("*") if p.is_file() and p.suffix.lower() in {".html", ".css", ".js", ".txt", ".xml", ".svg"}]


def validate() -> None:
    required = [
        OUT / "index.html",
        OUT / "style.css",
        OUT / "script.js",
        OUT / "404.html",
        OUT / "robots.txt",
        OUT / "sitemap.xml",
        OUT / "assets/nfl-mark.svg",
        OUT / "datenschutz/index.html",
        OUT / "nutzungsbedingungen/index.html",
    ]
    missing = [str(path.relative_to(OUT)) for path in required if not path.exists()]
    if missing:
        raise SystemExit(f"Built site missing required files: {', '.join(missing)}")

    for path in text_files():
        text = path.read_text(encoding="utf-8")
        if MIXED_CONTENT.search(text):
            raise SystemExit(f"Mixed-content URL found in {path.relative_to(OUT)}")
        for pattern in SECRET_PATTERNS:
            if pattern.search(text):
                raise SystemExit(f"Secret marker found in {path.relative_to(OUT)}")
        for pattern in LEGACY_MARKERS:
            if pattern.search(text):
                raise SystemExit(f"Legacy public marker found in {path.relative_to(OUT)}")

    for rel in ["index.html", "datenschutz/index.html", "nutzungsbedingungen/index.html"]:
        text = (OUT / rel).read_text(encoding="utf-8")
        if DISCORD_URL not in text:
            raise SystemExit(f"Discord URL missing from {rel}")

    home = (OUT / "index.html").read_text(encoding="utf-8")
    if 'href="datenschutz/"' not in home or 'href="nutzungsbedingungen/"' not in home:
        raise SystemExit("Project-relative legal links missing from homepage")


copy_source()
validate()
print(f"Built NFL Item-Verleih GitHub Pages site at {OUT}")
