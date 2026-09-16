VELTRIX Client Website V4.8

VELTRIX Client Site V4.6

# VELTRIX Client Website

## Website

Production:  
https://veltrixclient.de

Hosting:  
GitHub Pages

Deployment:  
GitHub Actions

GitHub Pages website for the independent VELTRIX Client project.

## Public URL

When this repository is named `veltrix-client`, GitHub Pages uses:

`https://veltrixclient.de`

GitHub Pages fallback: `https://gxcracks.github.io/veltrix-client/`

## Update the news feed

Edit `news.json` and add a new item at the top of the `items` array. Commit and push; GitHub Pages redeploys the site and the new entry appears automatically.

## Current download

Windows installer: `https://github.com/GxCracks/veltrix-client/releases/download/v0.8.0/VELTRIX-Setup-0.8.0.exe`

## Publishing

In GitHub open **Settings → Pages → Source → GitHub Actions** and push to `main`.


## Platform download chooser

The public download dialog offers Windows as the current real build. macOS is displayed as **Coming soon** until a tested Mac package exists.


## Platforms

- Windows: available
- macOS: coming soon
- Linux: coming soon


## V4.5 visual refresh

Richer VELTRIX color accents, improved platform cards and a redesigned Linux/Tux icon.


## Windows installer

The public Windows button points to the native GitHub Release asset:

`https://github.com/GxCracks/veltrix-client/releases/download/v0.8.0/VELTRIX-Setup-0.8.0.exe`

The workflow `.github/workflows/build-windows-installer.yml` builds the EXE on `windows-latest` using Java 21 `jpackage`. The installed app bundles its Java runtime, creates a Desktop shortcut and Start Menu entry, and registers normal Windows uninstall support. The clean ZIP in `downloads/` is only the compiled build input/fallback and contains no client source code.

The current installer is unsigned. Windows SmartScreen may warn until VELTRIX is code-signed with a trusted certificate.
