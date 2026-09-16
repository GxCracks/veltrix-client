$ErrorActionPreference = 'Stop'
$repoName = 'veltrix-client'

function Need($cmd, $message) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        throw $message
    }
}

Need 'git' 'Git is required. Install Git for Windows first: https://git-scm.com/download/win'
Need 'gh' 'GitHub CLI is required for one-click publishing. Install it from https://cli.github.com/ and run this file again.'

Write-Host 'VELTRIX GitHub Pages Publisher 4.8' -ForegroundColor Cyan
Write-Host 'Repository: veltrix-client (public)'

try {
    gh auth status 2>$null | Out-Null
} catch {
    Write-Host 'GitHub sign-in is required. Your browser will open.' -ForegroundColor Yellow
    gh auth login --web --git-protocol https
}

gh auth setup-git | Out-Null
$owner = (gh api user --jq '.login').Trim()
if ([string]::IsNullOrWhiteSpace($owner)) { throw 'Could not determine your GitHub username.' }
$fullRepo = "$owner/$repoName"

if (-not (Test-Path '.git')) {
    git init -b main | Out-Null
}

git config user.name 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { git config user.name 'VELTRIX Publisher' }
git config user.email 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { git config user.email 'veltrix@users.noreply.github.com' }

git add .
$changes = git status --porcelain
if ($changes) {
    git commit -m 'Publish VELTRIX website' | Out-Null
}

git branch -M main

$repoExists = $true
try { gh repo view $fullRepo --json name 2>$null | Out-Null } catch { $repoExists = $false }

if (-not $repoExists) {
    Write-Host "Creating public GitHub repository $fullRepo..." -ForegroundColor Cyan
    gh repo create $fullRepo --public --source . --remote origin --description 'Official public project website for VELTRIX Client.'
    $remoteUrl = "https://github.com/$fullRepo.git"
    $remotes = @(git remote)
    if ($remotes -contains 'origin') { git remote set-url origin $remoteUrl } else { git remote add origin $remoteUrl }
} else {
    Write-Host "Repository $fullRepo already exists; using it." -ForegroundColor Yellow
    $remoteUrl = "https://github.com/$fullRepo.git"
    $remotes = @(git remote)
    if ($remotes -contains 'origin') {
        git remote set-url origin $remoteUrl
        Write-Host 'Updated existing origin remote.' -ForegroundColor DarkGray
    } else {
        git remote add origin $remoteUrl
        Write-Host 'Added missing origin remote.' -ForegroundColor Green
    }
}

# Enable GitHub Pages with the custom workflow. Ignore 409 if Pages already exists.
try {
    gh api --method POST "repos/$fullRepo/pages" -f build_type='workflow' 2>$null | Out-Null
    Write-Host 'GitHub Pages enabled.' -ForegroundColor Green
} catch {
    try {
        gh api --method PUT "repos/$fullRepo/pages" -f build_type='workflow' 2>$null | Out-Null
        Write-Host 'GitHub Pages configured for Actions.' -ForegroundColor Green
    } catch {
        Write-Host 'Pages may already be enabled. The workflow will still be pushed.' -ForegroundColor Yellow
    }
}


# Publish a clean website history so previous development archives are not kept
# in the normal branch history after republishing.
Write-Host 'Preparing clean public website history...' -ForegroundColor Cyan
git checkout --orphan veltrix-public-clean | Out-Null
git rm -rf --cached . 2>$null | Out-Null
git add .
git commit -m 'Publish clean VELTRIX public website' | Out-Null
git branch -M main

Write-Host 'Pushing clean website history...' -ForegroundColor Cyan

git push -u origin main --force

$siteUrl = "https://$owner.github.io/$repoName/"
Write-Host ''
Write-Host 'Website deployment started.' -ForegroundColor Green
Write-Host "Expected public URL: $siteUrl" -ForegroundColor Green
Write-Host "Actions: https://github.com/$fullRepo/actions"
Write-Host 'It can take a few minutes for the Pages deployment and Windows installer build to complete.'
Write-Host "Windows installer: https://github.com/$fullRepo/releases/download/v0.8.0/VELTRIX-Setup-0.8.0.exe" -ForegroundColor Cyan
Write-Host "Installer workflow: https://github.com/$fullRepo/actions/workflows/build-windows-installer.yml"
