from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_site"

SITE_URL = "https://gxcracks.github.io/veltrix-client/"
CURRENT_VERSION = "0.8.2"
WINDOWS_INSTALLER = "https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe"

PUBLIC_FILES = [
    "index.html",
    "privacy.html",
    "404.html",
    "style.css",
    "script.js",
    "news.json",
    "robots.txt",
    "sitemap.xml",
    ".nojekyll",
]

INDEX_SEO = f'''  <link rel="canonical" href="{SITE_URL}">\n  <meta property="og:type" content="website">\n  <meta property="og:site_name" content="VELTRIX Client">\n  <meta property="og:title" content="VELTRIX Client — One Client. Many Versions.">\n  <meta property="og:description" content="Independent Minecraft Java launcher project for Windows with version management, Fabric support, news and a native Windows installer.">\n  <meta property="og:url" content="{SITE_URL}">\n  <meta property="og:image" content="{SITE_URL}assets/veltrix-logo-web.webp">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:title" content="VELTRIX Client — One Client. Many Versions.">\n  <meta name="twitter:description" content="Independent Minecraft Java launcher project for Windows.">\n  <meta name="twitter:image" content="{SITE_URL}assets/veltrix-logo-web.webp">\n'''

PRIVACY_URL = SITE_URL + "privacy.html"
PRIVACY_SEO = f'<meta name="description" content="Privacy information for the independent VELTRIX Client project."><link rel="canonical" href="{PRIVACY_URL}"><meta property="og:type" content="website"><meta property="og:title" content="VELTRIX Client — Privacy"><meta property="og:description" content="Privacy information for the independent VELTRIX Client project."><meta property="og:url" content="{PRIVACY_URL}"><meta property="og:image" content="{SITE_URL}assets/veltrix-logo-web.webp">'


def prepare_runtime_content():
    index = OUT / "index.html"
    text = index.read_text(encoding="utf-8")
    text = text.replace(
        "https://github.com/GxCracks/veltrix-client/releases/download/v0.8.0/VELTRIX-Setup-0.8.0.exe",
        WINDOWS_INSTALLER,
    )
    text = text.replace("0.8.0", CURRENT_VERSION)
    index.write_text(text, encoding="utf-8")

    script = OUT / "script.js"
    text = script.read_text(encoding="utf-8")
    text = text.replace(
        "https://github.com/GxCracks/veltrix-client/releases/download/v0.8.0/VELTRIX-Setup-0.8.0.exe",
        WINDOWS_INSTALLER,
    )
    script.write_text(text, encoding="utf-8")


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
    if (OUT / "CNAME").exists():
        raise SystemExit("CNAME must not be published while using the GitHub Pages project URL")

    runtime_files = [OUT / "index.html", OUT / "privacy.html", OUT / "404.html", OUT / "style.css", OUT / "script.js"]
    insecure = re.compile(r'(?:href|src)=["\']http://|url\(["\']?http://', re.I)
    for path in runtime_files:
        text = path.read_text(encoding="utf-8")
        if insecure.search(text):
            raise SystemExit(f"Mixed-content network reference found in {path.name}")

    index = (OUT / "index.html").read_text(encoding="utf-8")
    script = (OUT / "script.js").read_text(encoding="utf-8")
    privacy = (OUT / "privacy.html").read_text(encoding="utf-8")

    if SITE_URL not in index or 'rel="canonical"' not in index:
        raise SystemExit("GitHub Pages homepage canonical metadata missing")
    if PRIVACY_URL not in privacy:
        raise SystemExit("GitHub Pages privacy canonical metadata missing")
    if WINDOWS_INSTALLER not in index or WINDOWS_INSTALLER not in script:
        raise SystemExit("VELTRIX 0.8.2 Windows installer link missing")
    if f"VELTRIX Client {CURRENT_VERSION}" not in index:
        raise SystemExit("VELTRIX 0.8.2 version text missing")
    if "https://veltrixclient.de" in index or "https://veltrixclient.de" in privacy:
        raise SystemExit("Old custom-domain metadata remains in deployed pages")


if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir(parents=True)
for name in PUBLIC_FILES:
    source = ROOT / name
    if not source.exists():
        raise SystemExit(f"Missing public file: {name}")
    shutil.copy2(source, OUT / name)
shutil.copytree(ROOT / "assets", OUT / "assets")
prepare_runtime_content()
inject_seo()
validate()
print(f"Built GitHub Pages site at {OUT}")
