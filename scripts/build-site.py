from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_site"

PUBLIC_FILES = [
    "index.html",
    "privacy.html",
    "404.html",
    "style.css",
    "script.js",
    "news.json",
    "CNAME",
    "robots.txt",
    "sitemap.xml",
    ".nojekyll",
]

INDEX_SEO = '''  <link rel="canonical" href="https://veltrixclient.de/">\n  <meta property="og:type" content="website">\n  <meta property="og:site_name" content="VELTRIX Client">\n  <meta property="og:title" content="VELTRIX Client — One Client. Many Versions.">\n  <meta property="og:description" content="Independent Minecraft Java launcher project for Windows with version management, Fabric support, news and a native Windows installer.">\n  <meta property="og:url" content="https://veltrixclient.de/">\n  <meta property="og:image" content="https://veltrixclient.de/assets/veltrix-logo-web.webp">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:title" content="VELTRIX Client — One Client. Many Versions.">\n  <meta name="twitter:description" content="Independent Minecraft Java launcher project for Windows.">\n  <meta name="twitter:image" content="https://veltrixclient.de/assets/veltrix-logo-web.webp">\n'''

PRIVACY_SEO = '<meta name="description" content="Privacy information for the independent VELTRIX Client project."><link rel="canonical" href="https://veltrixclient.de/privacy.html"><meta property="og:type" content="website"><meta property="og:title" content="VELTRIX Client — Privacy"><meta property="og:description" content="Privacy information for the independent VELTRIX Client project."><meta property="og:url" content="https://veltrixclient.de/privacy.html"><meta property="og:image" content="https://veltrixclient.de/assets/veltrix-logo-web.webp">'


def inject_seo():
    index = OUT / "index.html"
    text = index.read_text(encoding="utf-8")
    if 'rel="canonical"' not in text:
        title = '  <title>VELTRIX Client — One Client. Many Versions.</title>\n'
        text = text.replace(title, title + INDEX_SEO, 1)
    index.write_text(text, encoding="utf-8")

    privacy = OUT / "privacy.html"
    text = privacy.read_text(encoding="utf-8")
    if 'rel="canonical"' not in text:
        title = '<title>VELTRIX Client — Privacy</title>'
        text = text.replace(title, title + PRIVACY_SEO, 1)
    privacy.write_text(text, encoding="utf-8")


def validate():
    if (OUT / "CNAME").read_text(encoding="utf-8").strip() != "veltrixclient.de":
        raise SystemExit("CNAME must contain exactly veltrixclient.de")

    runtime_files = [OUT / "index.html", OUT / "privacy.html", OUT / "404.html", OUT / "style.css", OUT / "script.js"]
    base_path = re.compile(r'(?:href|src)="/veltrix-client/|url\(["\']?/veltrix-client/', re.I)
    insecure = re.compile(r'(?:href|src)=["\']http://|url\(["\']?http://', re.I)
    for path in runtime_files:
        text = path.read_text(encoding="utf-8")
        if base_path.search(text):
            raise SystemExit(f"Repository base path found in {path.name}")
        if insecure.search(text):
            raise SystemExit(f"Mixed-content network reference found in {path.name}")

    index = (OUT / "index.html").read_text(encoding="utf-8")
    if "https://veltrixclient.de/" not in index or 'rel="canonical"' not in index:
        raise SystemExit("Homepage canonical metadata missing")
    if "VELTRIX-Setup-0.8.0.exe" not in index:
        raise SystemExit("Windows installer link missing")


if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir(parents=True)
for name in PUBLIC_FILES:
    source = ROOT / name
    if not source.exists():
        raise SystemExit(f"Missing public file: {name}")
    shutil.copy2(source, OUT / name)
shutil.copytree(ROOT / "assets", OUT / "assets")
inject_seo()
validate()
print(f"Built GitHub Pages site at {OUT}")
