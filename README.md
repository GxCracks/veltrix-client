# VELTRIX Client Website

## Website

Production:  
https://gxcracks.github.io/veltrix-client/

Hosting:  
GitHub Pages

Deployment:  
GitHub Actions

GitHub Pages website for the independent VELTRIX Client project.

## Public URL

The production website for this repository is:

`https://gxcracks.github.io/veltrix-client/`

## Update the news feed

Edit `news.json` and add a new item at the top of the `items` array. Commit and push; GitHub Pages redeploys the site and the new entry appears automatically.

## Current download

Windows installer: `https://github.com/GxCracks/veltrix-client/releases/download/v0.8.1/VELTRIX-Setup-0.8.1.exe`

## Publishing

In GitHub open **Settings → Pages → Source → GitHub Actions** and push to `main`.

## Platform download chooser

The public download dialog offers Windows as the current real build. macOS and Linux are displayed as **Coming soon** until tested packages exist.

## Platforms

- Windows: VELTRIX Client 0.8.1 available
- macOS: coming soon
- Linux: coming soon

## Windows installer

The public Windows button points to the native GitHub Release asset:

`https://github.com/GxCracks/veltrix-client/releases/download/v0.8.1/VELTRIX-Setup-0.8.1.exe`

The workflow `.github/workflows/build-windows-installer.yml` builds the EXE on `windows-latest` using Java 21 `jpackage`. VELTRIX 0.8.1 bundles `jdk.crypto.ec` for Microsoft TLS support. The installed app includes its Java runtime, creates a Desktop shortcut and Start Menu entry, and registers normal Windows uninstall support.

The current installer is unsigned. Windows SmartScreen may warn until VELTRIX is code-signed with a trusted certificate.
