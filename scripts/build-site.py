from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_site"

SITE_URL = "https://gxcracks.github.io/veltrix-client/"
CURRENT_VERSION = "0.8.2"
WINDOWS_INSTALLER = "https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe"
BRAND_LOGO = "assets/veltrix-brand.svg"
BRAND_MARK = "assets/veltrix-mark.svg"

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

INDEX_SEO = f'''  <link rel="canonical" href="{SITE_URL}">\n  <meta property="og:type" content="website">\n  <meta property="og:site_name" content="VELTRIX Client">\n  <meta property="og:title" content="VELTRIX Client — Beta / Early Access">\n  <meta property="og:description" content="VELTRIX Client Beta for Minecraft Java on Windows. Early Access test builds may still contain bugs.">\n  <meta property="og:url" content="{SITE_URL}">\n  <meta property="og:image" content="{SITE_URL}assets/veltrix-logo-web.webp">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:title" content="VELTRIX Client — Beta / Early Access">\n  <meta name="twitter:description" content="VELTRIX Client Beta for Minecraft Java on Windows.">\n  <meta name="twitter:image" content="{SITE_URL}assets/veltrix-logo-web.webp">\n'''

PRIVACY_URL = SITE_URL + "privacy.html"
PRIVACY_SEO = f'<meta name="description" content="Privacy information for the independent VELTRIX Client project."><link rel="canonical" href="{PRIVACY_URL}"><meta property="og:type" content="website"><meta property="og:title" content="VELTRIX Client — Privacy"><meta property="og:description" content="Privacy information for the independent VELTRIX Client project."><meta property="og:url" content="{PRIVACY_URL}"><meta property="og:image" content="{SITE_URL}assets/veltrix-logo-web.webp">'

BRAND_CSS = r'''

/* Stable VELTRIX brand lockup */
.brand{min-width:176px;gap:0}
.brand>img{width:168px;height:56px;object-fit:contain;filter:drop-shadow(0 0 14px rgba(40,206,255,.18))}
.brand>span{display:none}
.footer-brand>img{width:210px;height:82px;object-fit:contain;filter:drop-shadow(0 0 18px rgba(126,70,255,.16))}
@media (max-width:760px){
  .brand{min-width:138px}
  .brand>img{width:136px;height:46px}
  .footer-brand>img{width:178px;height:70px}
}
'''


def prepare_runtime_content():
    index = OUT / "index.html"
    text = index.read_text(encoding="utf-8")
    text = text.replace(
        "https://github.com/GxCracks/veltrix-client/releases/download/v0.8.0/VELTRIX-Setup-0.8.0.exe",
        WINDOWS_INSTALLER,
    )
    text = text.replace("0.8.0", CURRENT_VERSION)
    text = text.replace('<link rel="icon" href="assets/favicon.png">', f'<link rel="icon" href="{BRAND_MARK}" type="image/svg+xml">')
    text = text.replace('style.css?v=12', 'style.css?v=13')
    text = text.replace('script.js?v=12', 'script.js?v=13')
    text = text.replace('src="assets/veltrix-logo-web.webp" alt="VELTRIX logo"', f'src="{BRAND_LOGO}" alt="VELTRIX Client logo"')
    index.write_text(text, encoding="utf-8")

    script = OUT / "script.js"
    text = script.read_text(encoding="utf-8")
    text = text.replace(
        "https://github.com/GxCracks/veltrix-client/releases/download/v0.8.0/VELTRIX-Setup-0.8.0.exe",
        WINDOWS_INSTALLER,
    )
    script.write_text(text, encoding="utf-8")

    style = OUT / "style.css"
    style.write_text(style.read_text(encoding="utf-8") + BRAND_CSS, encoding="utf-8")


def inject_seo():
    index = OUT / "index.html"
    text = index.read_text(encoding="utf-8")
    if 'rel="canonical"' not in text:
        text = text.replace("</head>", INDEX_SEO + "</head>", 1)
    index.write_text(text, encoding="utf-8")

    privacy = OUT / "privacy.html"
    text = privacy.read_text(encoding="utf-8")
    if 'rel="canonical"' not in text:
        text = text.replace("</head>", PRIVACY_SEO + "</head>", 1)
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
    if CURRENT_VERSION not in index or "BETA / EARLY ACCESS" not in index:
        raise SystemExit("VELTRIX 0.8.2 beta version text missing")
    if BRAND_LOGO not in index or BRAND_MARK not in index:
        raise SystemExit("VELTRIX brand assets missing from built homepage")
    if "newLogoUrl" in script or "setAttribute('src', newLogoUrl)" in script:
        raise SystemExit("Legacy runtime logo swap remains in built JavaScript")
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
